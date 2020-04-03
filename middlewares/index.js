const path = require('path')
const root = path.join(__dirname, '..')
const user =  require(path.join(root, 'middlewares', 'user'))
const trackSupervision =  require(path.join(root, 'middlewares', 'trackSupervision'))
const jwt = require(path.join(root, 'middlewares', 'jwt'))

exports.user = user
exports.trackSupervision = trackSupervision
exports.jwt = jwt
