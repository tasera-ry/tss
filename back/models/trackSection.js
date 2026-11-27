const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Get the track sections matching a key.
   *
   * Every track has at least one section. A track that is not subdivided has a
   * single section covering all of it. `position` is the display order within
   * the track, from 1.
   *
   * @param {object} key - Identifying key, { id?, track_id? }
   * @return {Promise<object[]>} Sections that matched the key, in display order
   *
   * @example
   * model.read({ track_id: 1 })
   */
  read: async function readSection(key) {
    return knex('track_section')
      .where(key)
      .select('id', 'track_id', 'position', 'lane_count', 'name', 'description')
      .orderBy(['track_id', 'position']);
  },

  /**
   * Add a section after the track's last one.
   *
   * @param {object} section - { track_id, name, lane_count, description }
   * @return {Promise<object>} The section as stored
   */
  create: async function createSection(section) {
    return knex.transaction(async trx => {
      const { last } = await trx('track_section')
        .where({ track_id: section.track_id })
        .max('position as last')
        .first();
      const [row] = await trx('track_section')
        .insert({ ...section, position: (last ?? 0) + 1 })
        .returning(['id', 'track_id', 'position', 'lane_count', 'name', 'description']);
      return row;
    });
  },

  /**
   * Change a section, unless a smaller lane count no longer fits the bookings
   * from `from` on (#462). The check and the write share a transaction with
   * the section locked.
   *
   * @param {number} id - Section to change
   * @param {object} changes - { name?, lane_count?, description? }
   * @param {string} from - First date whose bookings must still fit, YYYY-MM-DD
   * @return {Promise<object>} { section } when stored, { refused } listing the
   *   days that do not fit, or {} when there is no such section
   */
  update: async function updateSection(id, changes, from) {
    return knex.transaction(async trx => {
      const current = await trx('track_section').where({ id }).forUpdate().first('lane_count');
      if (!current) return {};
      if (changes.lane_count !== undefined && changes.lane_count < current.lane_count) {
        const refused = (await peaks(trx, id, from))
          .filter(day => day.booked > changes.lane_count);
        if (refused.length > 0) return { refused };
      }
      const [section] = await trx('track_section')
        .where({ id })
        .update(changes)
        .returning(['id', 'track_id', 'position', 'lane_count', 'name', 'description']);
      return { section };
    });
  },

  /**
   * Delete a section, unless it is its track's last or has bookings from
   * `from` on. Its earlier bookings go with it (ON DELETE CASCADE).
   *
   * @param {number} id - Section to delete
   * @param {string} from - First date whose bookings keep the section, YYYY-MM-DD
   * @return {Promise<object>} { deleted: true }, { last: true }, { refused }
   *   listing the days with bookings, or {} when there is no such section
   */
  delete: async function deleteSection(id, from) {
    return knex.transaction(async trx => {
      const section = await trx('track_section').where({ id }).forUpdate().first('track_id');
      if (!section) return {};
      const { count } = await trx('track_section')
        .where({ track_id: section.track_id })
        .count('* as count')
        .first();
      if (Number(count) <= 1) return { last: true };
      const refused = await peaks(trx, id, from);
      if (refused.length > 0) return { refused };
      await trx('track_section').where({ id }).del();
      return { deleted: true };
    });
  }
};

/**
 * The most lanes a section has booked at once on each day from `from` on, as
 * the lane-capacity trigger counts them: concurrent use peaks at the start of
 * some booking.
 *
 * @return {Promise<{ date: string, booked: number }[]>} Days in date order
 */
async function peaks(trx, sectionId, from) {
  const { rows } = await trx.raw(`
    select to_char(day, 'YYYY-MM-DD') as date, max(booked)::int as booked
    from (
      select r.date as day, sum(o.lanes_used) as booked
      from track_reservation r
      join track_reservation o
        on o.track_section_id = r.track_section_id
        and o.date = r.date
        and o.start_time <= r.start_time
        and o.end_time > r.start_time
      where r.track_section_id = ? and r.date >= ?
      group by r.id, r.date
    ) as starts
    group by day
    order by day`, [sectionId, from]);
  return rows;
}

module.exports = model;
