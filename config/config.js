const crypto = require('crypto')

const config = {
  server: {
    host: process.env.SERVER_HOST || 'http://localhost:3000',
    port: 8000
  },
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(2 ** 8).toString('hex')
  },
  development: {
    range_id: 1
  },
  bcrypt: {
    hashRounds: 8
  },

  seeds: {
    seed: 0,
    users: 50,
    ranges: 1,
    tracks: 7,
    startDate: '2020-01-01',
    endDate: '2020-12-31',
    // chunkSize = how many rows are inserted in a single insertion, larger
    // chunk size equals faster insertions, but a value that is too high causes
    // errors. In case of errors, try dropping the factor down.
    chunkSize: 10 ** 4
  }
};

module.exports = config;
