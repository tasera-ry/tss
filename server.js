const path = require("path");

//azure gives port as an environment variable
const port = process.env.PORT || 8000;

/**** Express imports ****/

const express = require("express");

const app = express();
app.get('/', (req, res) => res.send('Best app'))

app.listen(port, () => {
	console.log()
});