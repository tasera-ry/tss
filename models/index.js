const path = require('path')
const root = path.join(__dirname, '..')
const models = path.join(root, 'models')
const user = require(path.join(models, 'user'))
const track = require(path.join(models, 'track'))

exports.user = user
exports.track = track
