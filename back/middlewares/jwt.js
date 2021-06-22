const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const services = require(path.join(root, 'services'));
const jwt = require('jsonwebtoken');

exports.read = [
  async function checkJwt(request, response, next) {
    let users;

    try {
      const decoded = jwt.verify(request.cookies.token, config.jwt.secret);
      users = await services.user.read(decoded);
    } catch(e) {
      return next(e.message);
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
  async function validateJWTtoken(request, response, next) {
    try {
      const token = request.cookies.token;

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
