// One-time backfill: production databases bootstrapped before track
// sections existed have the real tracks ("Rata 1".."Rata 7") but no
// sections. Fill in the customer's section layout (7.10.2026) for tracks
// that don't have any sections yet. Tracks are matched by name, and
// nothing is inserted for tracks that already have sections, so this is
// a no-op wherever the section seed has already done its job.
// See knex/sectionLayout.js for the layout.

const path = require('path');
const { insertMissingSections } = require(path.join(__dirname, '..', '..', 'sectionLayout'));

exports.up = async function(knex) {
  await insertMissingSections(knex);
};

exports.down = async function(knex) {
  // Remove exactly the rows the backfill would have inserted; sections
  // created by hand are left alone.
  const { sectionsByTrackName, buildSectionRows } = require(path.join(__dirname, '..', '..', 'sectionLayout'));
  const tracks = await knex('track')
    .whereIn('name', Object.keys(sectionsByTrackName))
    .select('id', 'name', 'description');
  for (const track of tracks) {
    for (const row of buildSectionRows(track, sectionsByTrackName[track.name])) {
      await knex('track_section').where(row).del();
    }
  }
};
