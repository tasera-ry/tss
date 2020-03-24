const _ = require('lodash')

const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const secret = require(path.join(root, 'config', 'config')).jwt.secret

const controller = {
  read: async function readTrack(request, response) {
    console.log("CONT TRACK READ");
    
    return response
      .status(200)
      .send(response.locals.queryResult)
  }

  , create: async function createTrack(request, response) {
    console.log("CONT TRACK CREATE");
    
    return response
      .set('Location', response.locals.address)
      .status(201)
      .send(response.locals.queryResult)
  }

  , read: async function readTrackAll(request, response) {
    console.log("CONT TRACK READ ALL???");
    
    return response
      .status(200)
      .send(response.locals.queryResult)
  }

  , update: async function updateTrack(request, response) {
    console.log("CONT TRACK UPDATE");
    
    response
      .status(204)
      .send()
  }

  , delete: async function deleteTrack(request, response) {
    console.log("CONT TRACK DELETE");
    
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
