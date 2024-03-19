const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const _ = require('lodash');

async function createSchedule(request, response, next) {
  const query = response.locals.matched;
  try {
    response.locals.queryResult = await services.schedule.create(query);
  } catch(e) {
    return next(e);
  }

  response.set('Location', `api/schedule/${response.locals.queryResult.id}`);
  return next();
}

async function readSchedule(request, response, next) {
  const query = response.locals.matched;

  try {
    response.locals.queryResult = await services.schedule.read(query, []);
  } catch(e) {
    return next(e);
  }
  return next();
}

async function updateSchedule(request, response, next) {
  const id = _.pick(response.locals.matched, 'id');
  const updates = _.pick(
    response.locals.matched,
    'range_reservation_id',
    'association_id',
    'open',
    'close'
  );

  try {
    response.locals.queryResult = await services.schedule.update(id, updates);
  } catch(e) {
    return next(e);
  }

  return next();
}

async function deleteSchedule(request, response, next) {
  const query = response.locals.matched;

  try {
    response.locals.queryResult = await services.schedule.delete(query);
  } catch(e) {
    return next(e);
  }
  return next();
}

module.exports = {
  create: createSchedule,
  read: readSchedule,
  update: updateSchedule,
  delete: deleteSchedule
};
