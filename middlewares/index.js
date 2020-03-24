const path = require('path')
const root = path.join(__dirname, '..')
const user =  require(path.join(root, 'middlewares', 'user'))
const jwt = require(path.join(root, 'middlewares', 'jwt'))

exports.user = user
exports.jwt = jwt
