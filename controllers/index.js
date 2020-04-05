const path = require('path')
const root = path.join(__dirname, '..')
const controllers = path.join(root, 'controllers')
const user = require(path.join(controllers, 'user'))
const track = require(path.join(controllers, 'track'))

exports.user = user
exports.track = track
