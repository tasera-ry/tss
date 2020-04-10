const path = require('path')
const root = path.join(__dirname, '..')
const models = path.join(root, 'models')
const user = require(path.join(models, 'user'))

exports.user = user
