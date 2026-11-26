const path = require('path');
const { email } = require('../mailer');
const root = path.join(__dirname, '..');
const middlewares = require(path.join(root, 'middlewares'));
const validators = require(path.join(root, 'validators'));
const moment = require('moment');
const knex = require('../knex/knex');

// Returns the supervision date, or undefined if it can not be found.
// The format can be given as the second parameter.
async function getSupervisionDate(scheduleId, format = 'D.M.YYYY') {
  try {
    const rows = await knex
      .from('scheduled_range_supervision')
      .leftJoin(
        'range_reservation',
        'scheduled_range_supervision.range_reservation_id',
        'range_reservation.id'
      )
      .select('range_reservation.date')
      .where({ 'scheduled_range_supervision.id': scheduleId });

    if (rows.length > 0 && rows[0].date) {
      return moment(rows[0].date).format(format);
    }
    console.log('No supervision date found for id:', scheduleId);
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

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
  if (response.locals.queryResult.length === 0) {
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
  if (request.body && (request.body.supervisor || request.body.originalSupervisor)) {
    // Options for the emails. scheduleId must be a plain number, not an object.
    const emailOptions = { reservationId: request.params.id };
    if (request.body.scheduleId) {
      emailOptions.scheduleId = request.body.scheduleId;
      const date = await getSupervisionDate(request.body.scheduleId);
      if (date) {
        emailOptions.dates = [date];
      }
    }

    // send update email to supervisor associations
    if (request.body.originalSupervisor !== request.body.supervisor) {
      // notify new supervisor about assigned supervision
      if (request.body.supervisor) {
        email('assigned', request.body.supervisor, emailOptions);
      }
      // notify old supervisor that their supervision cancelled
      if (request.body.originalSupervisor) {
        email('cancelled', request.body.originalSupervisor, emailOptions);
      }
    } else if (request.body.supervisor) {
      // if supervisor was not changed
      email('update', request.body.supervisor, emailOptions);
    }
  }
  return response
    .status(204)
    .send();
}

async function deleteReservation(request, response) {

  if (response.locals.queryResult === 0) {
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
  , delete: [
    validators.reservation.delete
    , middlewares.reservation.delete
    , deleteReservation
  ]
};
