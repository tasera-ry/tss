// Seeds the track sections for the production bootstrap: matches the real
// tracks by name ("Rata 1".."Rata 7") and fills in the customer's section
// layout (7.10.2026) for any of them that don't have sections yet, so
// re-running can't duplicate anything. See knex/sectionLayout.js.

const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const { sectionsByTrackName, insertMissingSections } = require(path.join(root, 'knex', 'sectionLayout'));

exports.seed = async function(knex) {
  const trackNames = Object.keys(sectionsByTrackName);
  const found = Number(
    (await knex('track')
      .whereIn('name', trackNames)
      .count('id as count'))[0].count
  );

  if (found !== trackNames.length) {
    throw new Error(
      'Track section seed expects tracks named ' + trackNames.join(', ') +
      `, but found only ${found} of ${trackNames.length}.`
    );
  }

  await insertMissingSections(knex);
};
