const crypto = require('crypto');

const config = {
  server: {
    host: process.env.SERVER_HOST || 'http://localhost:3000',
    port: 8000,
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || crypto.randomBytes(2 ** 8).toString('hex'),
  },
  development: {
    range_id: 56,
  },
  bcrypt: {
    hashRounds: 8,
  },

  seeds: {
    seed: 0,
    users: 10,
    ranges: 1,
    tracks: 7,
    // TODO fix dates to use for example start:(current date - 60 days) - end:(current date + 90 days)
    // TODO document this seed data date range and that dev only works fo this date range in README
    startDate: '2025-04-01',
    endDate: '2025-12-31',
    // chunkSize = how many rows are inserted in a single insertion, larger
    // chunk size equals faster insertions, but a value that is too high causes
    // errors. In case of errors, try dropping the factor down.
    chunkSize: 10 ** 4,
  },
};

module.exports = config;

