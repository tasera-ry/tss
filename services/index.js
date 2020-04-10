const path = require('path')
const root = path.join(__dirname, '..')

const user = require(path.join(root, 'services', 'user'))

exports.user = user
