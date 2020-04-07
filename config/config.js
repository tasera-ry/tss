const crypto = require('crypto')

const config = {
  server: {
    port: 8000
  },
  jwt: {
    secret: crypto.randomBytes(2 ** 8).toString('hex')
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
