const express = require('express');
const router = express.Router();
const _ = require('lodash');

const path = require('path');
const root = path.join(__dirname, '.');

const validators = require(path.join(root, 'validators'));
const middlewares = require(path.join(root, 'middlewares'));
const controllers = require(path.join(root, 'controllers'));

const oldSchedule = require(path.join(root, 'controllers', 'oldSchedule'));

router.route('/sign')
  .post(
    middlewares.user.sign,
    controllers.user.sign);

router.route('/reset')
  .post(
    controllers.resetPassword.check)
  .get(
    controllers.resetPassword.verify)
  .put(
    controllers.resetPassword.update);

// NOTE: no checking token: if invalid, we can never
// logout (remove the invalid cookie) in that case
router.route('/signout')
  .post(
    controllers.user.signout);

router.route('/user')
  .all(
    middlewares.jwt.read)
  .get(
    middlewares.user.readFilter,
    controllers.user.readFilter)
  .post(
    middlewares.user.hasProperty('role', 'superuser'),
    middlewares.user.create,
    controllers.user.create);

router.route('/user/:id')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .get(
    middlewares.user.read,
    controllers.user.read)
  .put(
    middlewares.user.update,
    controllers.user.update)
  .delete(
    middlewares.user.delete,
    controllers.user.delete);

router.route('/changeownpassword/:id')
  .put(
    middlewares.jwt.read,
    middlewares.user.updateOwnPasswordFilter,
    middlewares.user.update,
    controllers.user.update
);


// Track supervision
router.route('/track-supervision')
  .get(
    middlewares.trackSupervision.readFilter,
    controllers.trackSupervision.readFilter)
  .post(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser','supervisor'], _.includes),
    middlewares.trackSupervision.create,
    controllers.trackSupervision.create);

router.route('/track-supervision/:scheduled_range_supervision_id/:track_id')
  .get(
    middlewares.trackSupervision.read,
    controllers.trackSupervision.read)
  .put(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser','supervisor'], _.includes),
    middlewares.trackSupervision.update,
    controllers.trackSupervision.update)
  .delete(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    middlewares.trackSupervision.delete,
    controllers.trackSupervision.delete);

// Range supervision
router.route('/range-supervision')
  .get(
    middlewares.rangeSupervision.readFilter,
    controllers.rangeSupervision.readFilter)
  .post(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser','supervisor'], _.includes),
    middlewares.rangeSupervision.create,
    controllers.rangeSupervision.create);

router.route('/range-supervision/feedback')
  .put(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser','supervisor'], _.includes),
    validators.rangeSupervision.feedback,
    middlewares.rangeSupervision.feedback,
    controllers.rangeSupervision.feedback);

router.route('/range-supervision/usersupervisions/:id')
  .get(
    middlewares.rangeSupervision.userSupervisions,
    controllers.rangeSupervision.userSupervisions);

router.route('/range-supervision/:scheduled_range_supervision_id')
  .get(
    middlewares.rangeSupervision.read,
    controllers.rangeSupervision.read)
  .put(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser','supervisor'], _.includes),
    middlewares.rangeSupervision.update,
    controllers.rangeSupervision.update)
  .delete(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    middlewares.rangeSupervision.delete,
    controllers.rangeSupervision.delete);


router.route('/reservation')
  .get(controllers.reservation.read)
  .post(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    controllers.reservation.create);

router.route('/reservation/:id')
  .get(controllers.reservation.readStrict)
  .put(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser','supervisor'], _.includes),
    controllers.reservation.update)
  .delete(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    controllers.reservation.delete);

router.route('/schedule')
  .get(controllers.schedule.read)
  .post(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    controllers.schedule.create);

router.route('/schedule/:id')
  .get(controllers.schedule.readStrict)
  .put(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', ['superuser', 'supervisor'], _.includes),
    controllers.schedule.update)
  .delete(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    controllers.schedule.delete);

/*
*  Track
*/
router.route('/track')
  .get(
    validators.track.readAll,
    middlewares.track.read,
    controllers.track.read)
  .post(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'),
    validators.track.create,
    middlewares.track.create,
    controllers.track.create);

router.route('/track/:track_id')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .get(
    validators.track.read,
    middlewares.track.read,
    controllers.track.read)
  .put(
    validators.track.update,
    middlewares.track.update,
    controllers.track.update)
  .delete(
    validators.track.delete,
    middlewares.track.delete,
    controllers.track.delete);

router.route('/daterange/week/:begin')
  .get(
    middlewares.daterange.readWeek,
    controllers.daterange.read);

router.route('/daterange/freeform/:begin/:end')
  .get(
    middlewares.daterange.readFreeform,
    controllers.daterange.read);

router.route('/datesupreme/:date')
  .get(oldSchedule.getScheduleDate);

router.route('/validate')
  .get(middlewares.jwt.validate);

router.route('/email-settings')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .get(controllers.emailSettings.read)
  .put(
    validators.emailSettings.update,
    controllers.emailSettings.update);

router.route('/send-pending')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .get(controllers.emailSettings.sendPendingEmails);

router.route('/members')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .get(
    validators.members.readAll,
    middlewares.members.read,
    controllers.members.read)
  .post(
    validators.members.create,
    middlewares.members.create,
    controllers.members.create
  );

router.route('/members/:user_id')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .get(
    validators.members.read,
    middlewares.members.read,
    controllers.members.read)
  .put(
    validators.members.update,
    middlewares.members.update,
    controllers.members.update
  );

router.route('/set-raffled-supervisors')
  .all(
    middlewares.jwt.read,
    middlewares.user.hasProperty('role', 'superuser'))
  .post(
    validators.raffleSupervisors.checkRaffleResults,
    controllers.raffleSupervisors.set
  );
  
router.route('/raffle')
  .post(
    validators.raffle.create,
    middlewares.raffle.create,
    controllers.raffle.create
  );

module.exports = router;
