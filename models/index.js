const path = require('path')
const root = path.join(__dirname, '..')
const models = path.join(root, 'models')
const user = require(path.join(models, 'user'))
const trackSupervision = require(path.join(models, 'trackSupervision'))

exports.user = user
exports.trackSupervision = trackSupervision
