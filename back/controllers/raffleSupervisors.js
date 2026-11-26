const path = require('path');
const moment = require('moment');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const { email } = require('../mailer.js');

// Send one "assigned" email to each association that got shifts in the raffle
async function sendAssignedEmails(assignedSupervisions) {
  // Nothing to send, for example if the raffle returned no results
  if (!Array.isArray(assignedSupervisions)) {
    return;
  }
  // associationId -> { scheduleId, dates }
  const byAssociation = new Map();
  for (const item of assignedSupervisions) {
    // Skip results that have no association
    if (!item || !item.associationId) {
      continue;
    }
    if (!byAssociation.has(item.associationId)) {
      byAssociation.set(item.associationId, { scheduleIds: [], dates: [] });
    }
    const group = byAssociation.get(item.associationId);
    group.scheduleIds.push(item.scheduleId);
    group.dates.push(item.date);
  }

  for (const [associationId, group] of byAssociation) {
    try {
      // Dates are sorted first (YYYY-MM-DD sorts correctly), then formatted
      // Invalid dates are left out so the email never says "Invalid date".
      const dates = group.dates
        .sort()
        .map(date => moment(date))
        .filter(date => date.isValid())
        .map(date => date.format('D.M.YYYY'));
      await email('assigned', associationId, { scheduleId: group.scheduleIds[0], scheduleIds: group.scheduleIds, dates });
    } catch (error) {
      // A failed email must not make the raffle fail
      console.error(error);
    }
  }
}

const controller = {
  set: async function setRaffledSupervisors (req, res) {
    try {
      const raffleResults = req.body.results;
      if (!Array.isArray(raffleResults)) {
        return res.sendStatus(400);
      }
      const assignedSupervisions = await services.raffleSupervisors.set(raffleResults);

      try {
        await sendAssignedEmails(assignedSupervisions);
      } catch (error) {
        console.error('Error when sending the raffle emails:', error);
      }
      res.sendStatus(200);
    } catch (e) {
      console.log(e);
      res.send(500);
    }
  }
};

module.exports = controller;