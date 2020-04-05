const config = {
  server: {
    port: 8000
  },
  jwt: {
    secret: 'example-secret'
  },
  development: {
    range_id: 1
  },
  bcrypt: {
    hashRounds: 8
  },

  seeds: {
    users: 30,
    ranges: 1,
    tracks: 7,
    startDate: '2018-12-31',
    days: 565
  }
};

module.exports = config;
