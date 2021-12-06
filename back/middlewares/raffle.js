const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const serviceCalls = {
  create: async function createRaffle(request, response, next) {
    const body = response.locals.body;

    try {
      response.locals.queryResult = await services.raffle.create(body, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  }
};

module.exports = serviceCalls;