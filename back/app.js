const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const router = require('./routes');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//server calls are all in the routes
app.use('/api', morgan('short'));
app.use('/api', router);

// Rendering the front-end react app
app.use('/', express.static('../front/build/'));


module.exports = app;
