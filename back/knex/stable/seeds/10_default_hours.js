const moment = require('moment');

exports.seed = function (knex) {
  const defaultHours = [
    {
      day: 'monday',
      open: moment().hour(17).minute(0).format('HH:mm:ss'),
      close: moment().hour(20).minute(0).format('HH:mm:ss'),
    },
    {
      day: 'tuesday',
      open: moment().hour(17).minute(0).format('HH:mm:ss'),
      close: moment().hour(20).minute(0).format('HH:mm:ss'),
    },
    {
      day: 'wednesday',
      open: moment().hour(17).minute(0).format('HH:mm:ss'),
      close: moment().hour(20).minute(0).format('HH:mm:ss'),
    },
    {
      day: 'thursday',
      open: moment().hour(17).minute(0).format('HH:mm:ss'),
      close: moment().hour(20).minute(0).format('HH:mm:ss'),
    },
    {
      day: 'friday',
      open: moment().hour(17).minute(0).format('HH:mm:ss'),
      close: moment().hour(20).minute(0).format('HH:mm:ss'),
    },
    {
      day: 'saturday',
      open: moment().hour(10).minute(0).format('HH:mm:ss'),
      close: moment().hour(16).minute(0).format('HH:mm:ss'),
    },
    {
      day: 'sunday',
      open: moment().hour(17).minute(0).format('HH:mm:ss'),
      close: moment().hour(20).minute(0).format('HH:mm:ss'),
    },
  ];

  return knex('default_hours')
    .del()
    .then(() => {
      return knex('default_hours').insert(defaultHours);
    });
};

