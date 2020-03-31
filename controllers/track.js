const _ = require('lodash')

const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const secret = require(path.join(root, 'config', 'config')).jwt.secret

const controller = {
  read: async function readTrack(request, response) {
    console.log("CONT TRACK READ");
    
    //for filters return empty list instead
    let isFilter = !_.isEmpty(request.query)
    
    if(response.locals.queryResult.length === 0 && isFilter === false) {
      return response
        .status(404)
        .send({
          error: 'Unknown track'
        })
    }
    
    return response
      .status(200)
      .send(response.locals.queryResult)
  }

  , create: async function createTrack(request, response) {
    console.log("CONT TRACK CREATE");
    
    return response
      .status(201)
      .send(response.locals.queryResult)
  }

  , update: async function updateTrack(request, response) {
    console.log("CONT TRACK UPDATE");

    //return 204 no content
    return response
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
