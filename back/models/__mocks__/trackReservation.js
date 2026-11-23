const _ = require('lodash');

// Rows as stored, including `date`, which the real model filters on but does
// not return from read().
let reservations = [];
let nextId = 1;
let failNext = null;

function matches(row, key) {
  return Object.keys(key).every(field => row[field] === key[field]);
}

function takeFailure() {
  const error = failNext;
  failNext = null;
  if (error) throw error;
}

// Plain functions, not jest.fn(): the tests call jest.resetAllMocks().
const model = {
  read: async function readReservation(key) {
    return reservations
      .filter(reservation => matches(reservation, key))
      .map(reservation => _.omit(reservation, 'date'));
  },

  readRows: async function readRows(key) {
    return reservations.filter(reservation => matches(reservation, key));
  },

  create: async function createReservations(rows) {
    takeFailure();
    const created = rows.map(row => ({ id: nextId++, ...row }));
    reservations.push(...created);
    return created;
  },

  update: async function updateReservations(ids, changes) {
    takeFailure();
    reservations = reservations.map(row =>
      ids.includes(row.id) ? { ...row, ...changes } : row
    );
    return reservations.filter(row => ids.includes(row.id));
  },

  delete: async function deleteReservations(ids) {
    const before = reservations.length;
    reservations = reservations.filter(row => !ids.includes(row.id));
    return before - reservations.length;
  },

  seed: async function seed(rows) {
    reservations = rows.map(row => ({ ...row }));
    nextId = Math.max(0, ...rows.map(row => row.id || 0)) + 1;
  },

  clear: async function clear() {
    reservations = [];
    nextId = 1;
    failNext = null;
  },

  /** Make the next create or update throw, as the database would. */
  failNextWrite: function failNextWrite(error) {
    failNext = error;
  }
};

module.exports = model;
