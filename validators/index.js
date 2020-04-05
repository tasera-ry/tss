const path = require('path')
const root = path.join(__dirname, '..')
const user = require(path.join(root, 'validators', 'user'))
const reservation = require(path.join(root, 'validators', 'reservation'))
const schedule = require(path.join(root, 'validators', 'schedule'))
const track = require(path.join(root, 'validators', 'track'))

exports.user = user
exports.reservation = reservation
exports.schedule = schedule
exports.track = track