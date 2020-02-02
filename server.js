const path = require("path");

/**** Express imports ****/
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = require("./routes");
const port = process.env.PORT || 8000; //azure gives port as an environment variable

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//server calls are all in the routes
app.use("/api", router);
app.use("/", express.static("front/build/"))

app.listen(port, () => {
	console.log("Server on "+port)
});