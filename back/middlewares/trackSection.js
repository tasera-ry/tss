const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const serviceCalls = {
  read: async function readSections(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.trackSection.read(query);
    }
    catch(e) {
      return next(e);
    }

    return next();
  }
};

module.exports = serviceCalls;
