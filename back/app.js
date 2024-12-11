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


// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error("Error in middlewares: ", err);
  
    // Check if it's a custom error (e.g., AppError), otherwise default to 500
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    // Respond with a JSON error message
    res.status(statusCode).json({
      success: false,
      message: message
    });
  });


module.exports = app;
