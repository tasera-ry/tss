const path = require('path')
const root = path.join(__dirname, '..')
const controllers = path.join(root, 'controllers')
const user = require(path.join(controllers, 'user'))
const reservation = require(path.join(controllers, 'reservation'))
const schedule = require(path.join(controllers, 'schedule'))
const track = require(path.join(controllers, 'track'))
const trackSupervision = require(path.join(controllers, 'trackSupervision'))
const rangeSupervision = require(path.join(controllers, 'rangeSupervision'))

exports.user = user
exports.trackSupervision = trackSupervision
exports.rangeSupervision = rangeSupervision
exports.reservation = reservation
exports.schedule = schedule
exports.track = track
