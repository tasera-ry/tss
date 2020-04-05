const path = require('path')
const root = path.join(__dirname, '..')
const user =  require(path.join(root, 'middlewares', 'user'))
const jwt = require(path.join(root, 'middlewares', 'jwt'))
const track =  require(path.join(root, 'middlewares', 'track'))

exports.user = user
exports.jwt = jwt
exports.track = track
