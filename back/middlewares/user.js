const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const validators = require(path.join(root, 'validators'));
const _ = require('lodash');

/* Check that the user id in the session is the same as in the request parameter 
or that the user has admin role. */
const userUpdateCheck = function canUpdatePassword(request, response, next) {
  const session = response.locals.user;

  if (session.role === 'superuser') {
    return next();
  }

  if (Number(session.id) === Number(request.params.id)) {
    return next();
  }

  return response.status(403).send({
    error: 'User doesn\'t have privileges to this resource',
  });
};

const canRead = function canReadUserData(request, response, next) {
  const session = response.locals.user;
  const query = response.locals.query;

  if (session.role === 'superuser') {
    return next();
  }

  // Make sure the user being queried has the same id and/or name as the active
  // session
  if (_.isMatch(_.pick(session, 'name', 'id'), _.pick(query, 'name', 'id'))) {
    return next();
  }
  return response.status(403).send({
    error: 'User doesn\'t have privileges to this resource'
  });
};

exports.hasProperty = function userHasProperty(propertyName, value, equalityFn) {
  function propertyEquals(obj) {
    return equalityFn === undefined
      ? obj[propertyName] === value
      : equalityFn(value, obj[propertyName]);
  }

  return function (request, response, next) {
    if (propertyEquals(response.locals.user)) {
      return next();
    }
    return response.status(403).send({
      error: 'User doesn\'t have privileges to this resource'
    });
  };
};

const serviceCalls = {
  sign: async function signUser(request, response, next) {
    const credentials = response.locals.credentials;

    try {
      response.locals.user = await services.user.authenticate(credentials);
    }
    catch (e) {
      /*
       * Something went wrong in the database call, possibly user doesn't
       * exist, password was incorrect, or some connection error
       */

      // handle known errors unknown user and incorrect password with a
      // response
      if (e.name === 'Invalid credentials') {
        return response
          .status(401)
          .send({
            error: e.message
          });
      }
      else {
        // Rest should be moved to an error handler (respond with 500?)
        return next(e);
      }
    }

    return next();
  },

  readFilter: async function readFilterUser(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.user.read(query, []);
    }
    catch (e) {
      // Connection and other unexpected errors
      return next(e);
    }

    return next();
  },

  read: async function readUser(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.user.read(query, []);
    }
    catch (e) {
      return next(e);
    }

    return next();
  },

  create: async function createUser(request, response, next) {
    const query = response.locals.query;
    let id;

    try {
      id = await services.user.create(query);
    }
    catch (e) {
      return next(e);
    }

    try {
      response.locals.queryResult = await services.user.read({ id: id });
    }
    catch (e) {
      return next(e);
    }

    response.set('Location', `/api/user/${id}`);
    return next();
  },

  update: async function updateUser(request, response, next) {
    const id = response.locals.id;
    const updates = response.locals.updates;

    try {
      response.locals.queryResult = await services.user.update(id, updates);
    } catch (e) {
      if (e.name === 'Unknown user') {
        return response
          .status(404)
          .send({
            error: e.name
          });
      }

      return next(e);
    }

    return next();
  },

  delete: async function deleteUser(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.user.delete(query);
    } catch (e) {
      return next(e);
    }

    return next();
  }
};

exports.sign = [
  validators.user.sign,
  serviceCalls.sign
];

exports.readFilter = [
  validators.user.readFilter,
  canRead,
  serviceCalls.readFilter
];

exports.read = [
  validators.user.read,
  serviceCalls.read
];

exports.create = [
  validators.user.create,
  serviceCalls.create
];

exports.update = [
  validators.user.update,
  serviceCalls.update
];

exports.delete = [
  validators.user.delete,
  serviceCalls.delete
];

exports.updateOwnPasswordFilter = [
  validators.user.updatePassword,
  userUpdateCheck,
];

exports.userUpdateCheck = userUpdateCheck;