// Seeds the track sections with the layout reported by the customer
// (7.10.2026). The generic dev track seed creates 7 tracks in order with
// no link to the customer's numbering, so the i:th seeded track is treated
// as "Rata i + 1" and given that track's sections.
//
// The layout itself lives in knex/sectionLayout.js.

const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const { sectionsByTrackName, buildSectionRows } = require(path.join(root, 'knex', 'sectionLayout'));

exports.seed = async function(knex) {
  const trackNames = Object.keys(sectionsByTrackName);
  const tracks = await knex('track').orderBy('id');

  if (tracks.length !== trackNames.length) {
    throw new Error(
      `Track section seed expects ${trackNames.length} tracks, ` +
      `found ${tracks.length}. Update knex/sectionLayout.js to match.`
    );
  }

  const sections = tracks.flatMap((track, i) =>
    buildSectionRows(track, sectionsByTrackName[trackNames[i]])
  );

  await knex('track_section').insert(sections);
};
