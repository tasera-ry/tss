const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
//const validators = require(path.join(root, 'validators'));
const _ = require('lodash');

const serviceCalls = {
  read: async function readMembers(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.members.read(query, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  }
};

module.exports = serviceCalls;