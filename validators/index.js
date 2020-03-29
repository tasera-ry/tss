const path = require('path')
const root = path.join(__dirname, '..')
const user = require(path.join(root, 'validators', 'user'))
const reservation = require(path.join(root, 'validators', 'reservation'))

exports.user = user
exports.reservation = reservation
