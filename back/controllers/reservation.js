const path = require('path');
const { email } = require('../mailer');
const root = path.join(__dirname, '..');
const middlewares = require(path.join(root, 'middlewares'));
const validators = require(path.join(root, 'validators'));

async function createReservation(request, response) {
  return response
    .status(201)
    .send(response.locals.queryResult);
}

async function readReservation(request, response) {
  return response
    .status(200)
    .send(response.locals.queryResult);
}

async function readReservationStrict(request, response) {
  if(response.locals.queryResult.length === 0) {
    return response
      .status(404)
      .send({
        error: 'Query didn\'t match a reservation'
      });
  }

  return response
    .status(200)
    .send(response.locals.queryResult);
}

async function updateReservation(request, response) {
  if( request.body && request.body.supervisor ) {
    const scheduleId = request.body.scheduleId ? {scheduleId: request.body.scheduleId} : undefined;
    // send update email to supervisor associations
    if( request.body.originalSupervisor && request.body.originalSupervisor !== request.body.supervisor ) {
      // notify new supervisor about assigned supervision
      if (request.body.originalSupervisor) {
        email('cancelled', request.body.originalSupervisor, emailOptions);
      }
      // if supervisor was not changed
      email('update', request.body.supervisor, scheduleId)
    }
  }
  return response
    .status(204)
    .send();
}

async function deleteReservation(request, response) {

  if(response.locals.queryResult === 0) {
    return response
      .status(404)
      .send({
        error: `No reservation exists matching id ${response.locals.matched.id}`
      });
  }

  return response
    .status(204)
    .send();
}

module.exports = {
  create: [
    validators.reservation.create
    , middlewares.reservation.create
    , createReservation
  ]
  , read: [
    validators.reservation.read
    , middlewares.reservation.read
    , readReservation
  ]
  , readStrict: [
    validators.reservation.readStrict
    , middlewares.reservation.read
    , readReservationStrict
  ]
  , update: [
    validators.reservation.update
    , middlewares.reservation.update
    , updateReservation
  ]
  , delete : [
    validators.reservation.delete
    , middlewares.reservation.delete
    , deleteReservation
  ]
};
