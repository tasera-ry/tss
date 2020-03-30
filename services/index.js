const path = require('path')
const root = path.join(__dirname, '..')

const user = require(path.join(root, 'services', 'user'))
const reservation = require(path.join(root, 'services', 'reservation'))
const schedule = require(path.join(root, 'services', 'schedule'))

exports.user = user
exports.reservation = reservation
exports.schedule = schedule
