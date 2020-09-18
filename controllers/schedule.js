const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const middlewares = require(path.join(root, 'middlewares'))
const validators = require(path.join(root, 'validators'))

async function createSchedule(request, response) {
  return response
    .status(201)
    .send(response.locals.queryResult)
}

async function readSchedule(request, response) {
  return response
    .status(200)
    .send(response.locals.queryResult)
}

async function readScheduleStrict(request, response) {
  if(response.locals.queryResult.length === 0) {
    return response
      .status(404)
      .send({
        error: 'Query didn\'t match a schedule item'
      })
  }

  return response
    .status(200)
    .send(response.locals.queryResult)
}

async function updateSchedule(request, response) {
  return response
    .status(204)
    .send()
}

async function deleteSchedule(request, response) {
  if(response.locals.queryResult === 0) {
    return response
      .status(404)
      .send({
        error: `No schedule item exists matching id ${response.locals.matched.id}`
      })
  }

  return response
    .status(204)
    .send()
}

module.exports = {
  create: [
    validators.schedule.create
    , middlewares.schedule.create
    , createSchedule
  ]
  , read: [
    validators.schedule.read
    , middlewares.schedule.read
    , readSchedule
  ]
  , readStrict: [
    validators.schedule.readStrict
    , middlewares.schedule.read
    , readScheduleStrict
  ]
  , update: [
    validators.schedule.update
    , middlewares.schedule.update
    , updateSchedule
  ]
  , delete : [
    validators.schedule.delete
    , middlewares.schedule.delete
    , deleteSchedule
  ]
}
