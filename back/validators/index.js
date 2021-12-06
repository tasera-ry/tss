const path = require('path');
const root = path.join(__dirname, '..');

const user = require(path.join(root, 'validators', 'user'));
const reservation = require(path.join(root, 'validators', 'reservation'));
const schedule = require(path.join(root, 'validators', 'schedule'));
const track = require(path.join(root, 'validators', 'track'));
const trackSupervision = require(path.join(root, 'validators', 'trackSupervision'));
const rangeSupervision = require(path.join(root, 'validators', 'rangeSupervision'));
const daterange = require(path.join(root, 'validators', 'daterange'));
const emailSettings = require(path.join(root, 'validators', 'emailSettings'));
const members = require(path.join(root, 'validators', 'members'));
const raffle = require(path.join(root, 'validators', 'raffle'));
<<<<<<< HEAD
const raffleSupervisors = require(path.join(root, 'validators', 'raffleSupervisors'));
=======
>>>>>>> dates as input for raffle backend

exports.user = user;
exports.trackSupervision = trackSupervision;
exports.rangeSupervision = rangeSupervision;
exports.reservation = reservation;
exports.schedule = schedule;
exports.track = track;
exports.daterange = daterange;
exports.emailSettings = emailSettings;
exports.members = members;
<<<<<<< HEAD
exports.raffle = raffle;
exports.raffleSupervisors = raffleSupervisors;
=======
exports.raffle = raffle;
>>>>>>> dates as input for raffle backend
