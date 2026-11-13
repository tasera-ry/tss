// Section layout for the range's tracks, as reported by the customer
// (7.10.2026), keyed by track name. Shared by the development seed, the
// stable bootstrap seed and the track section backfill migration so the
// customer's data lives in exactly one place.
//
// Tracks that aren't divided into blocks are modeled as a single section
// covering the whole track, named after the track.

const sectionsByTrackName = {
  'Rata 1': [
    { name: 'Vasemmanpuoleisin', lane_count: 20 },
    { name: 'Keskimmäinen', lane_count: 20 },
    { name: 'Oikeanpuoleisin', lane_count: 20 }
  ],
  'Rata 2': [{ lane_count: 40 }],
  'Rata 3': [{ lane_count: 40 }],
  'Rata 4': [
    { name: 'Merkityt paikat', lane_count: 4 },
    { name: 'Merkitsemättömät paikat', lane_count: 20 }
  ],
  'Rata 5': [{ lane_count: 4 }],
  'Rata 6': [{ lane_count: 60 }],
  'Rata 7': [{ lane_count: 25 }]
};

// Turns one track and its blocks into track_section rows, positions 1..n.
// A block's description states its size; a whole-track section inherits
// the track's own description.
function buildSectionRows(track, blocks) {
  return blocks.map((block, position) => ({
    track_id: track.id,
    position: position + 1,
    lane_count: block.lane_count,
    description: block.name ? `${block.lane_count} paikan lohko` : track.description,
    name: block.name || track.name
  }));
}

// Inserts sections for the known tracks that don't have any yet, so the
// bootstrap seed and the backfill migration can run repeatedly without
// duplicating anything. Returns the number of rows inserted.
async function insertMissingSections(knex) {
  const tracks = await knex('track')
    .whereIn('name', Object.keys(sectionsByTrackName))
    .select('id', 'name', 'description');
  const tracksWithSections = new Set(
    (await knex('track_section')
      .whereIn('track_id', tracks.map(track => track.id))
      .select('track_id'))
      .map(row => row.track_id)
  );
  const rows = tracks
    .filter(track => !tracksWithSections.has(track.id))
    .flatMap(track => buildSectionRows(track, sectionsByTrackName[track.name]));
  if (rows.length > 0) {
    await knex('track_section').insert(rows);
  }
  return rows.length;
}

module.exports = { sectionsByTrackName, buildSectionRows, insertMissingSections };
