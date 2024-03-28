exports.seed = async function (knex) {
  const devices = [
    { id: 1, device_name: 'Labradar', status: 'free' },
    { id: 2, device_name: 'Timer 1', status: 'free' },
    { id: 3, device_name: 'Timer 2', status: 'free' },
  ];

  return knex('devices').insert(devices);
};
