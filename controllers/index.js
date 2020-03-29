const path = require('path')
const root = path.join(__dirname, '..')
const controllers = path.join(root, 'controllers')
const user = require(path.join(controllers, 'user'))
const reservation = require(path.join(controllers, 'reservation'))

exports.user = user
exports.reservation = reservation
