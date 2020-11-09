const path = require('path');
const root = path.join(__dirname, '..');

const user = require(path.join(root, 'services', 'user'));
const track = require(path.join(root, 'services', 'track'));
const reservation = require(path.join(root, 'services', 'reservation'));
const schedule = require(path.join(root, 'services', 'schedule'));
const trackSupervision = require(path.join(root, 'services', 'trackSupervision'));
const rangeSupervision = require(path.join(root, 'services', 'rangeSupervision'));
const weekview = require(path.join(root, 'services', 'weekview'));

exports.user = user;
exports.trackSupervision = trackSupervision;
exports.rangeSupervision = rangeSupervision;
exports.reservation = reservation;
exports.schedule = schedule;
exports.track = track;
exports.weekview = weekview;
