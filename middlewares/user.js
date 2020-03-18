const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))

exports.read = async function readUser(request, response, next) {
  /* TODO user doesn't exist anymore in the database? */
  if(request.locals === undefined) {
    request.locals = {}
  }

  const users = await services.user.read(request.user)
  if(users.length > 1) {
    return next(Error('Query returned more than 1 user'))
  }
  if(users.length === 0) {
    return next(Error('Query returned no users'))
  }
  
  request.locals.user = users[0]
  return next()
}

exports.hasProperty = function userHasProperty(propertyName, value, equalityFn) {
  function propertyEquals(obj) {
    console.log(obj[propertyName], value)
    return equalityFn === undefined
      ? obj[propertyName] === value
      : equalityFn(obj[propertyName], value)
  }

  return function(request, response, next) {
    if(propertyEquals(request.locals.user)) {
      return next()
    }
    console.log('here')
    return response.status(403).send()
  }
}
