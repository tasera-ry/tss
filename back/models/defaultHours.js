const knex = require('../knex/knex');

const model = {
  read: async function readDefaultHours() {
    console.log('Fetching default hours for all weekdays from the database');
    const result = await knex('default_hours').select('day', 'open', 'close');
    console.log('Default hours fetched:', result);

    return result;
  },

  upsert: async function upsertDefaultHours(weekdays) {
    console.log('Updating default hours in the database');
    const validWeekdays = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const filteredWeekdays = weekdays.filter(({ day }) =>
      validWeekdays.includes(day.toLowerCase())
    );

    if (filteredWeekdays.length !== validWeekdays.length) {
      throw new Error('weekdays must contain all days from Monday to Sunday');
    }

    const queries = filteredWeekdays.map(({ day, open, close }) =>
      knex('default_hours')
        .insert({ day, open, close })
        .onConflict('day')
        .merge()
    );
    return await Promise.all(queries);
  },
};

module.exports = model;

