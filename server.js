const path = require("path");

/**** Express imports ****/
const express = require("express");
const app = express();
const port = process.env.PORT || 8000; //azure gives port as an environment variable

app.get('/api/ping', (req, res) => {
	res.send({ pong: 'Server here' });
});

app.use('/', express.static('front/build/'))

app.listen(port, () => {
	console.log()
});