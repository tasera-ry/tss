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
  },

  create: async function createSection(request, response, next) {
    return write(response, next,
      () => services.trackSection.create(response.locals.body));
  },

  update: async function updateSection(request, response, next) {
    return write(response, next,
      () => services.trackSection.update(response.locals.id, response.locals.body));
  },

  delete: async function deleteSection(request, response, next) {
    return write(response, next,
      () => services.trackSection.delete(response.locals.id));
  }
};

/** Run a write; the service's own refusals carry a status and details. */
async function write(response, next, call) {
  try {
    response.locals.queryResult = await call();
  } catch (error) {
    if (error.status) {
      return response.status(error.status).send({
        success: false,
        message: error.message,
        ...error.details
      });
    }
    return next(error);
  }
  return next();
}

module.exports = serviceCalls;
