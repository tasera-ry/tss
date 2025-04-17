const knex = require('../knex/knex');

const model = {
  read: async function readDefaultHours() {
    console.log('Fetching default hours from the database');
    const result = await knex('default_hours').select('open', 'close');
    console.log('Default hours fetched:', result);
    if (result.length === 0) {
      console.log('No default hours found in the database');
      return null;
    }
    return result;
  },

  upsert: async function upsertDefaultHours({ open, close }) {
    console.log('Updating default hours in the database');
    return await knex('default_hours')
      .insert({ id: 1, open, close })
      .onConflict('id')
      .merge();
  },
};

module.exports = model;

