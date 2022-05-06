const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  create: async (message) => {
    return await knex.transaction(trx => {
      return trx
        .returning('*')
        .insert(message)
        .into('info_messages')
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },
  read: async (message) => {
    return await knex.transaction(trx => {
      if(message.start)
        trx = trx.whereRaw('start >= ? OR end <= ?', [message.start,message.start]);
      if(message.end)
        trx = trx.whereRaw('start <= ?', [message.end]);
      if(message.show_monthly)
        trx = trx.whereRaw('show_monthly = ?', [message.show_monthly]);
      if(message.show_weekly)
        trx = trx.whereRaw('show_weekly = ?', [message.show_weekly]);
      return trx
        .select()
        .from('info_messages');
    });
  },
  update: async (message) => {
    return await knex.transaction(trx => {
      return trx('info_messages')
        .returning('*')
        .where({id: message.id})
        .update(message)
        .catch(trx.rollback);
    });
  },
  delete: async (message) => {
    return await knex.transaction(trx => {
      return trx('info_messages')
        .returning('*')
        .where({id: message.id})
        .delete()
        .catch(trx.rollback);
    });
  }
};

module.exports = model;