/**
 * A minimal in-memory fake of the knex builder used by the models, so model
 * unit tests can run without a database (CI has none) and can assert the
 * exact data the models hand to insert()/update()/del().
 *
 * It supports the subset of knex the models use:
 *   knex('table').where(key).select(fields)   (with .join/.leftJoin/.orderBy recorded but ignored)
 *   knex.transaction(trx => ...)
 *   trx('table').where(key).update(data) / .del()
 *   trx.returning(cols).insert(data).into('table').then(...) / .catch(...)
 *
 * Key names are allowed to be qualified ('track.id', 'device.id'), matching
 * how the services call the models; the table prefix is stripped.
 */

// Autoincrement column per table, mirroring the migrations.
const ID_COLUMNS = {
  devices: 'id',
  user: 'id',
  association: 'user_id',
  association_rangeofficers: 'rangeofficer_id',
  track: 'id',
  members: 'user_id',
  range_supervision: 'scheduled_range_supervision_id',
  track_supervision: 'scheduled_range_supervision_id',
};

const _ = require('lodash');

// Strip the table qualifier from a key or field name ('track.id' -> 'id').
function normalize(name) {
  return typeof name === 'string' && name.indexOf('.') !== -1
    ? name.slice(name.lastIndexOf('.') + 1)
    : name;
}

function matches(row, where) {
  return Object.keys(where).every((key) => row[normalize(key)] === where[key]);
}

function createFakeKnex() {
  const tables = {};   // { tableName: [row, ...] }
  const counters = {}; // { tableName: lastAssignedId }
  const queries = [];  // log of every executed statement

  function rowsOf(table) {
    if (!tables[table]) tables[table] = [];
    return tables[table];
  }

  function nextId(table) {
    counters[table] = (counters[table] || 0) + 1;
    return counters[table];
  }

  // Executes the statement captured in a builder's state.
  function execute(state) {
    const table = state.table;
    const where = state.where || {};
    const record = {
      table,
      op: state.op || 'select',
      where,
      data: state.data,
      returning: state.returning,
    };
    queries.push(record);

    if (!state.op || state.op === 'select') {
      let rows = rowsOf(table).filter((row) => matches(row, where));
      if (Array.isArray(state.fields)) {
        rows = rows.map((row) => {
          const out = {};
          state.fields.forEach((field) => {
            const name = normalize(field);
            if (name in row) out[name] = row[name];
          });
          return out;
        });
      }
      return Promise.resolve(rows.map((row) => ({ ...row })));
    }

    if (state.op === 'insert') {
      const row = { ...state.data };
      const idColumn = ID_COLUMNS[table];
      if (idColumn && row[idColumn] === undefined) {
        row[idColumn] = nextId(table);
      }
      rowsOf(table).push(row);
      if (state.returning) {
        const cols = Array.isArray(state.returning) ? state.returning : [state.returning];
        return Promise.resolve([_.pick(row, cols.map(normalize))]);
      }
      return Promise.resolve([row]);
    }

    if (state.op === 'update') {
      const targets = rowsOf(table).filter((row) => matches(row, where));
      targets.forEach((row) => Object.assign(row, state.data));
      return Promise.resolve(targets.length);
    }

    if (state.op === 'delete') {
      const table_ = rowsOf(table);
      const removed = table_.filter((row) => matches(row, where));
      tables[table] = table_.filter((row) => !matches(row, where));
      return Promise.resolve(removed.length);
    }

    return Promise.reject(new Error(`fakeKnex: unsupported op ${state.op}`));
  }

  // A query builder: chainable, thenable, and callable with a table name to
  // spawn a fresh builder. Chain methods mutate the builder's state so that
  // `.returning(...).insert(...).into(...).then(...)` and
  // `.where(...).update(...)` both work, matching how the models call knex.
  function makeBuilder(initialTable) {
    const state = {
      table: initialTable || null,
      op: null,
      data: null,
      where: null,
      returning: null,
      fields: null,
    };

    const builder = function (table) {
      return makeBuilder(table);
    };

    builder._state = state;

    builder.where = (key) => {
      state.where = { ...(state.where || {}), ...key };
      return builder;
    };
    builder.returning = (cols) => {
      state.returning = cols;
      return builder;
    };
    builder.insert = (data) => {
      state.op = 'insert';
      state.data = data;
      return builder;
    };
    builder.update = (data) => {
      state.op = 'update';
      state.data = data;
      return builder;
    };
    builder.del = () => {
      state.op = 'delete';
      return builder;
    };
    builder.into = (table) => {
      state.table = table;
      return builder;
    };
    builder.select = (fields) => {
      state.fields = fields;
      return builder;
    };
    // Recorded but not emulated; reads are filtered on the flat merged row.
    builder.join = () => builder;
    builder.leftJoin = () => builder;
    builder.orderBy = () => builder;
    builder.from = (table) => {
      state.table = table;
      return builder;
    };

    builder.then = (onFulfilled, onRejected) =>
      execute(state).then(onFulfilled, onRejected);
    builder.catch = (onRejected) => execute(state).catch(onRejected);

    return builder;
  }

  // knex/trx is callable ('table') and exposes the builder methods, so both
  // trx('track').where(...) and trx.returning(...).insert(...) work.
  const knex = makeBuilder();

  knex.transaction = (callback) => {
    const trx = makeBuilder();
    // Like knex: commit resolves the transaction with the given value,
    // rollback rejects it with the given error.
    trx.commit = (value) => value;
    trx.rollback = (err) => {
      throw err;
    };
    return Promise.resolve().then(() => callback(trx));
  };

  // Test helpers, inspected directly by the tests.
  knex.rows = (table) => rowsOf(table).map((row) => ({ ...row }));
  knex.queries = () => queries.map((q) => ({ ...q }));
  knex.clear = () => {
    Object.keys(tables).forEach((t) => delete tables[t]);
    Object.keys(counters).forEach((t) => delete counters[t]);
    queries.length = 0;
  };

  return knex;
}

module.exports = { createFakeKnex };
