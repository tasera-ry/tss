const path = require('path')
const root = path.join(__dirname, '..')

const user = require(path.join(root, 'services', 'user'))
const track = require(path.join(root, 'services', 'track'))

exports.user = user
exports.track = track
