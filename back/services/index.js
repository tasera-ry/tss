const path = require('path');
const root = path.join(__dirname, '..');

const user = require(path.join(root, 'services', 'user'));
const track = require(path.join(root, 'services', 'track'));
const reservation = require(path.join(root, 'services', 'reservation'));
const schedule = require(path.join(root, 'services', 'schedule'));
const trackSupervision = require(path.join(root, 'services', 'trackSupervision'));
const rangeSupervision = require(path.join(root, 'services', 'rangeSupervision'));
const daterange = require(path.join(root, 'services', 'daterange'));
const emailSettings = require(path.join(root, 'services', 'emailSettings'));
const pendingEmails = require(path.join(root, 'services', 'pendingEmails'));
const raffle = require(path.join(root, 'services', 'raffle'));
const members = require(path.join(root, 'services', 'members'));

exports.user = user;
exports.trackSupervision = trackSupervision;
exports.rangeSupervision = rangeSupervision;
exports.reservation = reservation;
exports.schedule = schedule;
exports.track = track;
exports.daterange = daterange;
exports.emailSettings = emailSettings;
exports.pendingEmails = pendingEmails;
exports.raffle = raffle;
exports.members = members;
