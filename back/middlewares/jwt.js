const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const expressJWT = require('express-jwt')({ secret: config.jwt.secret, algorithms: ['HS256'] });
const services = require(path.join(root, 'services'));

const jwt = require('jsonwebtoken');

exports.read = [
  expressJWT,
  async function expandJWTContent(request, response, next) {
    let users;

    try {
      users = await services.user.read(request.user);
    } catch(e) {
      return next(e);
    }

    if(users.length !== 1) {
      const err = Error('Authorization token didn\'t identify a user');
      err.name = 'Authorization error';
      return next(err);
    }

    response.locals.user = users.pop();
    return next();
  }
];

exports.validate = [
  expressJWT,
  async function validateJWTtoken(request, response, next) {
    try {
      // Removing bearer_ from the auth headers to get only token
      let token = request.headers.authorization.slice(7);

      jwt.verify(token, config.jwt.secret, (err, decoded) => { // eslint-disable-line
        if (err) {
          response.status(403);
          return next(err);
        }
        else {
          return response.status(200).send({
            success: true,
            message: 'Authentication successful'
          });
        }
      });
    }
    catch (error) {
      return next(error);
    }

    return next();
  }
];
