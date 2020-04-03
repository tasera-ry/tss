const path = require('path')
const root = path.join(__dirname, '..')

const user = require(path.join(root, 'services', 'user'))
const trackSupervision = require(path.join(root, 'services', 'trackSupervision'))

exports.user = user
exports.trackSupervision = trackSupervision
