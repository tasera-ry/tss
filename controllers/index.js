const path = require('path')
const root = path.join(__dirname, '..')
const controllers = path.join(root, 'controllers')
const user = require(path.join(controllers, 'user'))
const trackSupervision = require(path.join(controllers, 'trackSupervision'))

exports.user = user
exports.trackSupervision = trackSupervision
