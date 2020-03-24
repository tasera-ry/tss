const path = require('path')
const root = path.join(__dirname, '..')
const user =  require(path.join(root, 'middlewares', 'user'))
const track =  require(path.join(root, 'middlewares', 'track'))

exports.user = user
exports.track = track
