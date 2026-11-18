const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

// Raised by the enforce_section_lane_capacity trigger (#477).
const LANE_CONFLICT =
  /already using (\d+) of the section's (\d+) lane/;

/**
 * Turn the errors a write can meet into answers the scheduling view can show:
 * the database's lane, time-order and foreign-key checks, and the service's
 * own checks (which carry a status).
 */
function sendWriteError(error, response, next) {
  const conflict = error.code === 'P0001' && LANE_CONFLICT.exec(error.message);
  if (conflict) {
    const [, used, total] = conflict.map(Number);
    return response.status(409).send({
      success: false,
      message: 'Not enough free lanes',
      free: Math.max(0, total - used)
    });
  }
  if (error.code === '23514') {
    return response.status(400).send({
      success: false,
      message: 'The reservation must end after it starts'
    });
  }
  if (error.code === '23503') {
    return response.status(400).send({
      success: false,
      message: 'Unknown track section or association'
    });
  }
  if (error.status) {
    return response.status(error.status).send({
      success: false,
      message: error.message,
      ...error.details
    });
  }
  return next(error);
}

const serviceCalls = {
  read: async function readReservations(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.trackReservation.read(query);
    }
    catch(e) {
      return next(e);
    }

    return next();
  },

  create: async function createReservation(request, response, next) {
    try {
      response.locals.queryResult =
        await services.trackReservation.create(response.locals.body);
    }
    catch(e) {
      return sendWriteError(e, response, next);
    }

    return next();
  },

  update: async function updateReservation(request, response, next) {
    try {
      response.locals.queryResult = await services.trackReservation.update(
        response.locals.id,
        response.locals.body
      );
    }
    catch(e) {
      return sendWriteError(e, response, next);
    }

    return next();
  },

  delete: async function deleteReservation(request, response, next) {
    try {
      response.locals.queryResult =
        await services.trackReservation.delete(response.locals.id);
    }
    catch(e) {
      return sendWriteError(e, response, next);
    }

    return next();
  }
};

module.exports = serviceCalls;
