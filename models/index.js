const path = require('path')
const root = path.join(__dirname, '..')
const models = path.join(root, 'models')
const user = require(path.join(models, 'user'))
const reservation = require(path.join(models, 'reservation'))
const schedule = require(path.join(models, 'schedule'))

exports.user = user
exports.reservation = reservation
exports.schedule = schedule
