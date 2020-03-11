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
  }
};

module.exports = config;
