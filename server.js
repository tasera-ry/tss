const path = require("path");

// Database driver/query builder
const knex = require("knex")

// Configuration files
const { connection_config: pg } = require("./config/pg")

/**** Express imports ****/
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = require("./routes");
const port = process.env.PORT || 8000; //azure gives port as an environment variable

// Database connection initialization
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.PG_HOST || pg.host
        user: process.env.PG_USER || pg.user
        // Confirm you've set this environment variable, no password will be
        // pushed to github, but it can be found in
        // /root/tietokannan-tiedot.txt on the server
        password: process.env.PG_PASSWORD || pg.password
        database: process.env.PG_DATABASE || pg.database
    },
    searchPath: [process.env.PG_SEARCH_PATH || pg.search_path],
    // Set this to true when writing queries
    debug: process.env.PG_DEBUG || pg.debug
})

// db.raw('select 1+1 as result').then((result) => {
//     result.rows.forEach(console.log)
// })


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//server calls are all in the routes
app.use("/api", router);

// Rendering the front-end react app
app.use("/", express.static("front/build/"))

app.listen(port, () => {
	console.log("Server on "+port)
});
