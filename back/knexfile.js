const path = require('path');

require('dotenv').config();

module.exports = {
  // Development environment is for development purposes. The running
  // database server should have a database matching your unix username,
  // which is used by default. On windows you might need to set the
  // environment variable USER or USERNAME to the name registered on the
  // server. Enable query debugging by setting DB_DEBUG to 'true'.
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '0.0.0.0',
      user: process.env.DB_USER || 'tssuser',
      password: process.env.DB_PASSWORD,
      database: process.env.DB || process.env.USER || process.env.USERNAME,
      charset: 'utf8'
    },

    // why is true in string format?
    debug: process.env.DB_DEBUG === 'true' || false,

    migrations: {
      directory: path.join(__dirname, 'knex', 'development', 'migrations')
    },

    seeds: {
      directory: path.join(__dirname, 'knex', 'development', 'seeds')
    }
  },

  // Current production environment.
  stable: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'tssuser',
      password: process.env.DB_PASSWORD,
      database: process.env.DB || 'stable',
      charset: 'utf8'
    },

    debug: false,

    migrations: {
      directory: path.join(__dirname, 'knex', 'stable', 'migrations')
    },

    seeds: {
      directory: path.join(__dirname, 'knex', 'stable', 'seeds')
    }
  }
};
