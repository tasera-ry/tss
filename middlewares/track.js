const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const validators = require(path.join(root, 'validators'))

const serviceCalls = {
  //TODO figure out what response.locals.query should contain
  read: async function readTrack(request, response, next) {
    console.log("MW TRACK READ");
    
    const query = response.locals.query
    try {
      response.locals.queryResult = await services.track.read(query, [])
    }
    catch(e) {
      return next(e)
    }
    return next()
  }
  , create: async function createTrack(request, response, next) {
    console.log("MW TRACK CREATE");
    
    const query = response.locals.query
    let id
    try {
      id = await services.track.create(query)
    }
    catch(e) {
      return next(e)
    }

    try {
      response.locals.queryResult = await services.track.read({id: id})
    }
    catch(e) {
      return next(e)
    }
    //TODO ???
    response.locals.address = `/api/track/${id}`
    return next()
  }
  , update: async function updateTrack(request, response, next) {
    console.log("MW TRACK UPDATE");
    
    const id = response.locals.id
    const updates = response.locals.updates

    try {
      response.locals.queryResult = await services.track.update(id, updates)
    } catch(e) {
      return next(e)
    }
    return next()
  }
  , delete: async function deleteTrack(request, response, next) {
    console.log("MW TRACK DELETE");
    
    const query = response.locals.query
    try {
      response.locals.queryResult = await services.track.delete(query)
    } catch(e) {
      return next(e)
    }
    return next()
  }
}

exports.read = [
  validators.track.read
  , serviceCalls.read
]

exports.create = [
  validators.track.create
  , serviceCalls.create
]

exports.update = [
  validators.track.update
  , serviceCalls.update
]

exports.delete = [
  validators.track.delete
  , serviceCalls.delete
]