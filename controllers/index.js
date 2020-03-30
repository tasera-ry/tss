const path = require('path')
const root = path.join(__dirname, '..')
const controllers = path.join(root, 'controllers')
const user = require(path.join(controllers, 'user'))
const reservation = require(path.join(controllers, 'reservation'))
const schedule = require(path.join(controllers, 'schedule'))

exports.user = user
exports.reservation = reservation
exports.schedule = schedule
