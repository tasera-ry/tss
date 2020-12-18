const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const serviceCalls = {
  read: async function readTrack(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.track.read(query, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  },

  create: async function createTrack(request, response, next) {
    const query = response.locals.query;
    let id;

    try {
      id = await services.track.create(query);
    }
    catch(e) {
      return next(e);
    }

    try {
      response.locals.queryResult = await services.track.read({'track.id': id});
    }
    catch(e) {
      return next(e);
    }

    response.set('Location', `/api/track/${id}`);
    return next();
  },

  update: async function updateTrack(request, response, next) {
    const id = response.locals.id;
    const updates = response.locals.updates;
    try {
      response.locals.queryResult = await services.track.update(id, updates);
    } catch(e) {
      if(e.name === 'Unknown track') {
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

  delete: async function deleteTrack(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.track.delete(query);
    } catch(e) {
      return next(e);
    }

    return next();
  }
};

module.exports = serviceCalls;
