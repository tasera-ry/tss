const path = require('path')

module.exports = {
    unstable: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'tssuser',
            password: process.env.DB_PASSWORD,
            database: 'unstable',
            charset: 'utf8'
        },

        debug: true,

        migrations: {
            directory: path.join(__dirname, 'knex', 'unstable', 'migrations')
        },

        seeds: {
            directory: path.join(__dirname, 'knex', 'unstable', 'seeds')
        }
    },

    development: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'tssuser',
            password: process.env.PG_PASSWORD,
            database: 'development',
            charset: 'utf8'
        },

        debug: false,

        migrations: {
            directory: path.join(__dirname, 'knex', 'development', 'migrations')
        },
        seeds: {
            directory: path.join(__dirname, 'knex', 'development', 'seeds')
        }
    },

    // Personal environment is for development purposes. The running database
    // server should have a database matching your unix username, which is used
    // by default. On windows you might need to set the environment variable
    // USER or USERNAME to the name registered on the server.
    personal: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'tssuser',
            password: process.env.DB_PASSWORD,
            database: process.env.USER || process.env.USERNAME,
            charset: 'utf8'
        },

        debug: process.env.DB_DEBUG || true,

        migrations: {
            directory: path.join(__dirname, 'knex', 'personal', 'migrations')
        },

        seeds: {
            directory: path.join(__dirname, 'knex', 'personal', 'seeds')
        }
    },

    // Current production environment.
    stable: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'tssuser',
            password: process.env.DB_PASSWORD,
            database: 'stable',
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
}
