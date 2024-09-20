exports.seed = async function (knex) {
  const devices = [
    { device_name: 'Labradar', status: 'free' },
    { device_name: 'Timer 1', status: 'free' },
    { device_name: 'Timer 2', status: 'free' },
  ];

  return knex('devices').insert(devices);
};
