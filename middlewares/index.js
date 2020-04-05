const path = require('path')
const root = path.join(__dirname, '..')
const user =  require(path.join(root, 'middlewares', 'user'))
const jwt = require(path.join(root, 'middlewares', 'jwt'))
const track =  require(path.join(root, 'middlewares', 'track'))
const reservation = require(path.join(root, 'middlewares', 'reservation'))
const schedule = require(path.join(root, 'middlewares', 'schedule'))

exports.user = user
exports.jwt = jwt
exports.reservation = reservation
exports.schedule = schedule
exports.track = track

