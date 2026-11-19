const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));
const laneConflict = require(path.join(root, 'knex', 'laneConflict'));

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

function clientError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

// Pasi Autio, 13.11.2026: past days are read-only.
function assertNotPast(date) {
  if (date < today()) {
    throw clientError(400, 'Past days are read-only');
  }
}

function assertTimeOrder(start, end) {
  if (normaliseTime(start) >= normaliseTime(end)) {
    throw clientError(400, 'The reservation must end after it starts');
  }
}

// The holder of a booking must be a member association, not any account.
async function assertAssociation(id) {
  if (id === null || id === undefined) return;
  const [user] = await models.user.read({ id }, ['user.id', 'role']);
  if (!user || user.role !== 'association') {
    throw clientError(400, 'Unknown association');
  }
}

/**
 * Official use needs every lane of every section, so the trigger's lanes-free
 * figure for one section means nothing for it: say the track is not free.
 */
async function officialWrite(write) {
  try {
    return await write();
  } catch (error) {
    if (laneConflict(error)) {
      throw clientError(409, 'The track is not free for official use');
    }
    throw error;
  }
}

async function sectionOf(id) {
  const [section] = await models.trackSection.read({ id });
  if (!section) {
    throw clientError(400, `Unknown track section ${id}`);
  }
  return section;
}

/**
 * Official use takes the whole track (Pasi Autio, 13.11.2026), so it is stored
 * as one row per section of the track, each with every lane. Together those
 * rows are one booking: the ones on the same track, date and times.
 */
async function officialGroup(row) {
  const section = await sectionOf(row.track_section_id);
  const sections = await models.trackSection.read({ track_id: section.track_id });
  const sectionIds = sections.map(s => s.id);
  const rows = await models.trackReservation.readRows({
    type: 'official',
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time
  });
  return rows.filter(r => sectionIds.includes(r.track_section_id));
}

const service = {
  /**
   * Get the part-day reservations matching a key.
   *
   * @param {object} key - Identifying key, { date?, track_section_id? }
   * @return {Promise<object[]>} Reservations that matched the key
   */
  read: async function readReservation(key) {
    return models.trackReservation.read(_.pick(key, 'date', 'track_section_id'));
  },

  /**
   * Create a reservation. Official use expands to every section of the track
   * at full lanes and has no association.
   *
   * @param {object} data - { date, start_time, end_time, type, track_section_id,
   *   lanes_used?, association_id?, description? }
   * @return {Promise<object[]>} The stored rows
   */
  create: async function createReservation(data) {
    assertNotPast(data.date);
    assertTimeOrder(data.start_time, data.end_time);

    const base = {
      date: data.date,
      start_time: normaliseTime(data.start_time),
      end_time: normaliseTime(data.end_time),
      type: data.type,
      description: data.description ?? null
    };
    const section = await sectionOf(data.track_section_id);

    if (data.type === 'official') {
      const sections = await models.trackSection.read({ track_id: section.track_id });
      return officialWrite(() => models.trackReservation.create(sections.map(s => ({
        ...base,
        track_section_id: s.id,
        lanes_used: s.lane_count,
        association_id: null
      }))));
    }

    // The lane capacity trigger refuses too many lanes and reports what is free.
    await assertAssociation(data.association_id);
    return models.trackReservation.create([{
      ...base,
      track_section_id: section.id,
      lanes_used: data.lanes_used,
      association_id: data.association_id ?? null
    }]);
  },

  /**
   * Change a reservation. For official use the change applies to the whole
   * booking (every section of the track); its lanes, section and association
   * cannot change. The type cannot change either: delete and create instead.
   *
   * @param {number} id - Reservation to change
   * @param {object} changes - Any of date, start_time, end_time, lanes_used,
   *   track_section_id, association_id, description
   * @return {Promise<object[]|null>} The changed rows, or null if not found
   */
  update: async function updateReservation(id, changes) {
    const [current] = await models.trackReservation.readRows({ id });
    if (!current) {
      return null;
    }
    assertNotPast(current.date);

    const next = { ...current, ...changes };
    assertNotPast(next.date);
    assertTimeOrder(next.start_time, next.end_time);

    if (changes.type !== undefined && changes.type !== current.type) {
      throw clientError(400, 'The type cannot change: delete and create instead');
    }
    const official = current.type === 'official';
    const allowed = official
      ? ['date', 'start_time', 'end_time', 'description']
      : ['date', 'start_time', 'end_time', 'lanes_used', 'track_section_id',
        'association_id', 'description'];
    const refused = _.difference(Object.keys(_.omit(changes, 'type')), allowed);
    if (refused.length > 0) {
      throw clientError(400,
        'Official use takes the whole track: only the date, times and description can change');
    }

    const set = _.pick(changes, allowed);
    if (set.start_time) set.start_time = normaliseTime(set.start_time);
    if (set.end_time) set.end_time = normaliseTime(set.end_time);
    const ids = official
      ? (await officialGroup(current)).map(r => r.id)
      : [current.id];
    if (_.isEmpty(set)) {
      return Promise.all(ids.map(id => models.trackReservation.readRows({ id })))
        .then(rows => rows.flat());
    }

    if (set.track_section_id) await sectionOf(set.track_section_id);
    if (set.association_id) await assertAssociation(set.association_id);
    const write = () => models.trackReservation.update(ids, set);
    return official ? officialWrite(write) : write();
  },

  /**
   * Copy a track's day to other days in one save (#463): its status, its
   * notice and any of its bookings. Days without rows get them, closed, as the
   * Schedules page creates them. All or nothing: if a booking does not fit on
   * some day, nothing is stored and every such day is reported.
   *
   * @param {object} data - { track_id, dates, track_supervisor?, notice?,
   *   reservations?: [{ type, start_time, end_time, track_section_id?,
   *   lanes_used?, association_id?, description? }] }
   * @return {Promise<object>} { dates } copied to
   */
  copy: async function copyTrackDay(data) {
    const dates = _.uniq(data.dates).sort();
    dates.forEach(assertNotPast);
    const supervision = _.pick(data, 'track_supervisor', 'notice');
    const bookings = data.reservations || [];
    if (_.isEmpty(supervision) && bookings.length === 0) {
      throw clientError(400, 'Nothing to copy');
    }

    const sections = await models.trackSection.read({ track_id: data.track_id });
    if (sections.length === 0) {
      throw clientError(400, `Unknown track ${data.track_id}`);
    }
    const rows = [];
    for (const booking of bookings) {
      assertTimeOrder(booking.start_time, booking.end_time);
      const base = {
        start_time: normaliseTime(booking.start_time),
        end_time: normaliseTime(booking.end_time),
        type: booking.type,
        description: booking.description ?? null
      };
      if (booking.type === 'official') {
        rows.push(...sections.map(s => ({
          ...base,
          track_section_id: s.id,
          lanes_used: s.lane_count,
          association_id: null
        })));
        continue;
      }
      if (!sections.some(s => s.id === booking.track_section_id)) {
        throw clientError(400, `Unknown track section ${booking.track_section_id}`);
      }
      if (!booking.lanes_used) {
        throw clientError(400, 'A booking needs its lanes');
      }
      await assertAssociation(booking.association_id);
      rows.push({
        ...base,
        track_section_id: booking.track_section_id,
        lanes_used: booking.lanes_used,
        association_id: booking.association_id ?? null
      });
    }

    const conflicts = await models.trackReservation.copyDay({
      trackId: data.track_id,
      dates,
      supervision,
      reservations: rows
    });
    if (conflicts.length > 0) {
      throw clientError(409, 'Not enough free lanes', { conflicts });
    }
    return { dates };
  },

  /**
   * Delete a reservation; for official use, the whole booking.
   *
   * @param {number} id - Reservation to delete
   * @return {Promise<number>} How many rows were deleted, 0 if not found
   */
  delete: async function deleteReservation(id) {
    const [current] = await models.trackReservation.readRows({ id });
    if (!current) {
      return 0;
    }
    assertNotPast(current.date);

    const ids = current.type === 'official'
      ? (await officialGroup(current)).map(r => r.id)
      : [current.id];
    return models.trackReservation.delete(ids);
  }
};

module.exports = service;
