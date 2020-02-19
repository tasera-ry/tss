const path = require('path')

module.exports = {
    unstable: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'tssuser',
            password: process.env.PG_PASSWORD,
            database: 'unstable',
            charset: 'utf8'
        },

        debug: true,

        migrations: {
            directory: path.join(__dirname, 'knex' + 'migrations')
        },
        seeds: {
            directory: path.join(__dirname, 'knex' + 'seeds')
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
        }
    }
}
