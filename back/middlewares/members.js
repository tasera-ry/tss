const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
//const validators = require(path.join(root, 'validators'));
const _ = require('lodash');

const serviceCalls = {
  create: async function createMembers(request, response, next) {
    const query = response.locals.query;
    let user_id;

    try {
      user_id = await services.members.create(query);
    }
    catch(e) {
      return next(e);
    }

    try {
      response.locals.queryResult = await services.members.read({'user_id': user_id});
    }
    catch(e) {
      return next(e);
    }

    response.set('Location', `/api/members/${user_id}`);
    return next();
  },
  read: async function readMembers(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.members.read(query, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  },
  update: async function updateMembers(request, response, next) {
    const user_id = response.locals.user_id;
    const updates = response.locals.updates;
    try {
      response.locals.queryResult = await services.members.update(user_id, updates);
    } catch(e) {
      if(e.name === 'Unknown id') {
        return response
          .status(404)
          .send({
            error: e.name
          });
      }
      return next(e);
    }

    return next();
  }
};

module.exports = serviceCalls;
