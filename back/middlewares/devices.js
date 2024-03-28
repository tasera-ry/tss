const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const serviceCalls = {
  create: async function createDevice(request, response, next) {
    const query = response.locals.query;
    let id;

    try {
      id = await services.devices.create(query);
    } catch (error) {
      return next(error);
    }

    try {
      response.locals.queryResult = await services.devices.read({
        id: id,
      });
    } catch (e) {
      return next(e);
    }

    response.set('Location', `/api/devices/${id}`);
    return next();
  },
  read: async function readDevice(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.devices.read(query, []);
    } catch (e) {
      return next(e);
    }

    return next();
  },
  update: async function updateDevice(request, response, next) {
    const id = response.locals.id;
    const updates = response.locals.updates;

    try {
      response.locals.queryResult = await services.devices.update(id, updates);
    } catch (e) {
      if (e.name === 'Unknown device') {
        return response.status(404).send({
          error: e.name,
        });
      }

      return next(e);
    }
    return next();
  },
  delete: async function deleteDevice(request, response, next) {
    const id = response.locals.query;

    try {
      response.locals.queryResult = await services.devices.delete(id);
    } catch (e) {
      return next(e);
    }

    return next();
  },
};

module.exports = serviceCalls;
