const { validationResult, matchedData } = require('express-validator');
const _ = require('lodash')

const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))

const controller = {
  readFilter: async function readFilterSupervisions(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult)
  },

  read: async function read(request, response) {
    if(response.locals.queryResult.length === 0) {
      return response
        .status(404)
        .send({
          error: 'Query didn\'t match track supervision event'
        })
    }

    return response
      .status(200)
      .send(response.locals.queryResult)
  },

  create: async function createSupervision(request, response) {
    return response
      .status(201)
      .send(response.locals.queryResult)
  },

  // no returning response here?
  update: async function updateSupervision(request, response) {
    response
      .status(204)
      .send()
  },

  delete: async function deleteSupervision(request, response) {
    if(response.locals.queryResult === 0) {
      return response
        .status(404)
        .send({
          error: `No track supervision event exists matching id ${response.locals.query.scheduled_range_supervision_id} and ${response.locals.query.track_id}`
        })
    }

    return response
      .status(204)
      .send()
  }
}

module.exports = controller
