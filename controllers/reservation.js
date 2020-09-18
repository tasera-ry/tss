const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const middlewares = require(path.join(root, 'middlewares'))
const validators = require(path.join(root, 'validators'))

async function createReservation(request, response) {
  return response
    .status(201)
    .send(response.locals.queryResult)
}

async function readReservation(request, response) {
  return response
    .status(200)
    .send(response.locals.queryResult)
}

async function readReservationStrict(request, response) {
  if(response.locals.queryResult.length === 0) {
    return response
      .status(404)
      .send({
        error: 'Query didn\'t match a reservation'
      })
  }

  return response
    .status(200)
    .send(response.locals.queryResult)
}

async function updateReservation(request, response) {
  return response
    .status(204)
    .send()
}

async function deleteReservation(request, response) {
  if(response.locals.queryResult === 0) {
    return response
      .status(404)
      .send({
        error: `No reservation exists matching id ${response.locals.matched.id}`
      })
  }

  return response
    .status(204)
    .send()
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
}
