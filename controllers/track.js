const _ = require('lodash')

const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const secret = require(path.join(root, 'config', 'config')).jwt.secret

const controller = {
  read: async function readTrack(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult)
  }

  , create: async function createTrack(request, response) {
    return response
      .set('Location', response.locals.address)
      .status(201)
      .send(response.locals.queryResult)
  }

  , read: async function readTrack(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult)
  }

  , update: async function updateTrack(request, response) {
    response
      .status(204)
      .send()
  }

  , delete: async function deleteTrack(request, response) {
    if(response.locals.queryResult === 0) {
      return response
        .status(404)
        .send({
          error: `No track exists matching id ${response.locals.query.id}`
        })
    }
    return response
      .status(204)
      .send()
  }
}

module.exports = controller
