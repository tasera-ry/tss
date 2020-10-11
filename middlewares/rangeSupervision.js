const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const validators = require(path.join(root, 'validators'))

const serviceCalls = {
  readFilter: async function readFilterSupervision(request, response, next) {
    const query = response.locals.query
    try {
      response.locals.queryResult = await services.rangeSupervision.read(query)
    }
    catch(e) {
      // Connection and other unexpected errors
      return next(e)
    }

    return next()
  },

  read: async function readSupervision(request, response, next) {
    const query = response.locals.query

    try {
      response.locals.queryResult = await services.rangeSupervision.read(query)
    }
    catch(e) {
      return next(e)
    }

    return next()
  },

  create: async function createSupervision(request, response, next) {
    const query = response.locals.query
    let id

    try {
      id = await services.rangeSupervision.create(query)
    }
    catch(e) {
      // could be a constant?
      if(e.name === 'Supervision exists') {
        return response
          .status(400)
          .send({
            error: e.name
          })
      }

      return next(e)
    }

    try {
      response.locals.queryResult = await services.rangeSupervision.read({scheduled_range_supervision_id:id})
    }
    catch(e) {
      return next(e)
    }

    response.set('Location', `/api/range-supervision/${id}`)
    return next()
  },

  update: async function updateSupervision(request, response, next) {
    const id = response.locals.id
    const updates = response.locals.updates

    try {
      response.locals.queryResult = await services.rangeSupervision.update(id, updates)
    } catch(e) {
      if(e.name === 'Unknown supervision') {
        return response
          .status(404)
          .send({
            error: e.name
          })
      }

      return next(e)
    }

    return next()
  },

  delete: async function deleteSupervision(request, response, next) {
    const query = response.locals.query

    try {
      response.locals.queryResult = await services.rangeSupervision.delete(query)
    } catch(e) {
      return next(e)
    }

    return next()
  }
}

exports.readFilter = [
  validators.rangeSupervision.readFilter,
  serviceCalls.readFilter
]

exports.read = [
  validators.rangeSupervision.read,
  serviceCalls.read
]

exports.create = [
  validators.rangeSupervision.create,
  serviceCalls.create
]

exports.update = [
  validators.rangeSupervision.update,
  serviceCalls.update
]

exports.delete = [
  validators.rangeSupervision.delete,
  serviceCalls.delete
]
