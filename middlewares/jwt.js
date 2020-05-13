const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const expressJWT = require('express-jwt')({ secret: config.jwt.secret });
const services = require(path.join(root, 'services'));

exports.read = [
  expressJWT
  , async function expandJWTContent(request, response, next) {
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
  expressJWT
  , async function validateJWTtoken(request, response, next) {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    console.log(request);

    let users;
    try {
      users = await services.user.read(request.user);
      //expressJWT.validate(request.token);
    }
    catch (error) {
      //const err = Error('Token invalid');
      //err.name = 'Authorization error';
      return next(error);
    }

    response.locals.user = users.pop();
    return next();
  }
]