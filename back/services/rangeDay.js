const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

/** Today in Finland, YYYY-MM-DD, whatever time zone the server runs in. */
function today() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' });
}

/** "9:00" and "09:00:00" alike, as the database stores them. */
function normaliseTime(time) {
  const [hours, minutes, seconds = '00'] = String(time).split(':');
  return `${hours.padStart(2, '0')}:${minutes}:${seconds}`;
}

function clientError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const service = {
  /**
   * Write the range's settings (open or closed, hours, range officer shift)
   * to one or more days, all or nothing (#463).
   *
   * @param {object} data - { dates, available?, open?, close?, association_id? }
   * @return {Promise<object[]>} Per day: { date, scheduleId, from, to, changed }
   */
  write: async function writeRangeDays(data) {
    const dates = _.uniq(data.dates).sort();
    // Pasi Autio, 13.11.2026: past days are read-only.
    if (dates.some(date => date < today())) {
      throw clientError(400, 'Past days are read-only');
    }

    const changes = _.pick(data, 'available', 'association_id');
    if (('open' in data) !== ('close' in data)) {
      throw clientError(400, 'Opening hours need both open and close');
    }
    if ('open' in data) {
      changes.open = normaliseTime(data.open);
      changes.close = normaliseTime(data.close);
      if (changes.open >= changes.close) {
        throw clientError(400, 'The range must close after it opens');
      }
    }
    if (_.isEmpty(changes)) {
      throw clientError(400, 'Nothing to write');
    }

    // The shift is held by a member association, not any account.
    if (changes.association_id != null) {
      const [user] = await models.user.read({ id: changes.association_id }, ['user.id', 'role']);
      if (!user || user.role !== 'association') {
        throw clientError(400, 'Unknown association');
      }
    }

    return models.rangeDay.writeDays({ dates, changes });
  }
};

module.exports = service;
