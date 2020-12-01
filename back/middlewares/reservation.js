const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const _ = require('lodash');

async function createReservation(request, response, next) {
  const query = response.locals.matched;

  try {
    response.locals.queryResult = await services.reservation.create(query);
  } catch(e) {
    return next(e);
  }

  response.set('Location', `api/reservation/${response.locals.queryResult.id}`);
  return next();
}

async function readReservation(request, response, next) {
  const query = response.locals.matched;

  try {
    response.locals.queryResult = await services.reservation.read(
      query, [], query.from, query.to);
  } catch(e) {
    return next(e);
  }

  return next();
}

async function updateReservation(request, response, next) {
  const id = _.pick(response.locals.matched, 'id');
  const updates = _.pick(response.locals.matched, 'date', 'available');

  try {
    response.locals.queryResult = await services.reservation.update(id, updates);
  } catch(e) {
    return next(e);
  }

  return next();
}

async function deleteReservation(request, response, next) {
  const query = response.locals.matched;

  try {
    response.locals.queryResult = await services.reservation.delete(query);
  } catch(e) {
    return next(e);
  }

  return next();
}

module.exports = {
  create: createReservation,
  read: readReservation,
  update: updateReservation,
  delete: deleteReservation
};
