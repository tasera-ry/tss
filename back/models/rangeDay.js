const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));
const nextRangeSupervision = require(path.join(root, 'knex', 'rangeOfficerRule'));

const model = {
  /**
   * Write the range's settings to each day in one transaction (#463). A day
   * without rows gets them, closed and 17–20 as the old scheduling page did.
   *
   * @param {object} write - { dates, changes: { available?, open?, close?,
   *   association_id? } }
   * @return {Promise<object[]>} Per day: { date, scheduleId, from, to, changed,
   *   assigned }: the shift's association before and after, whether anything
   *   was written, and whether `to` was (re)assigned the shift
   */
  writeDays: async function writeDays({ dates, changes }) {
    return knex.transaction(async trx => {
      const range = await trx('range').orderBy('id').first('id');
      const days = [];
      for (const date of dates) {
        let day = await trx('range_reservation')
          .where({ range_id: range.id, date })
          .first('id', 'available');
        if (!day) {
          [day] = await trx('range_reservation')
            .insert({ range_id: range.id, date, available: false })
            .returning(['id', 'available']);
        }
        let schedule = await trx('scheduled_range_supervision')
          .where({ range_reservation_id: day.id })
          .first('id', 'open', 'close', 'association_id');
        if (!schedule) {
          [schedule] = await trx('scheduled_range_supervision')
            .insert({ range_reservation_id: day.id, open: '17:00', close: '20:00' })
            .returning(['id', 'open', 'close', 'association_id']);
        }
        let changed = false;

        if ('available' in changes && changes.available !== day.available) {
          await trx('range_reservation')
            .where({ id: day.id })
            .update({ available: changes.available });
          changed = true;
        }

        const scheduleChanges = {};
        for (const column of ['open', 'close', 'association_id']) {
          if (column in changes && changes[column] !== schedule[column]) {
            scheduleChanges[column] = changes[column];
          }
        }
        if (Object.keys(scheduleChanges).length > 0) {
          await trx('scheduled_range_supervision')
            .where({ id: schedule.id })
            .update(scheduleChanges);
          changed = true;
        }

        const from = schedule.association_id ?? null;
        const to = 'association_id' in changes ? changes.association_id : from;
        const key = { scheduled_range_supervision_id: schedule.id };
        const current = await trx('range_supervision').where(key).first('range_supervisor');
        const supervision = nextRangeSupervision(current, from, to);
        if (supervision && current) {
          await trx('range_supervision')
            .where(key)
            .update({ ...supervision, updated_at: trx.fn.now() });
          changed = true;
        } else if (supervision) {
          await trx('range_supervision').insert({ ...key, ...supervision });
          changed = true;
        }

        const assigned = supervision?.range_supervisor === 'not confirmed';
        days.push({ date, scheduleId: schedule.id, from, to, changed, assigned });
      }
      return days;
    });
  }
};

module.exports = model;
