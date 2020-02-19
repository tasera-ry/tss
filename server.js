const path = require("path");

// Database driver/query builder
// const knex = require(path.join(__dirname, 'knex', 'knex'))

/**** Express imports ****/
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const router = require("./routes");
const config = require("./config/config");
const port = process.env.PORT || config.server.port; //azure gives port as an environment variable

//knex.schema.createTableIfNotExists('member', (table) => {
//    table.string('name').primary()
//    table.string('password')
//}).then(() => {
//    return knex('member').insert([
//        {name: 'veeti valvoja', password: 'password'}
//    ])
//})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//server calls are all in the routes
app.use("/api", router);

// Rendering the front-end react app
app.use("/", express.static("front/build/"))

app.listen(port, () => {
    console.log("Server on "+port)
});
