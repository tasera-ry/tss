// Seeds the track sections with the layout reported by the customer
// (7.10.2026). The i:th seeded track is treated as "Rata i + 1":
//
//   Rata 1: three 20 place blocks (leftmost / middle / rightmost)
//   Rata 2: 40
//   Rata 3: 40
//   Rata 4: marked places 4 + unmarked places 20
//   Rata 5: 4
//   Rata 6: 60
//   Rata 7: 25
//
// Tracks that aren't divided into blocks are modeled as a single section
// covering the whole track, named after the track.

const sectionsPerTrack = [
  // Rata 1
  [
    { name: 'Vasemmanpuoleisin', lane_count: 20 },
    { name: 'Keskimmäinen', lane_count: 20 },
    { name: 'Oikeanpuoleisin', lane_count: 20 }
  ],
  // Rata 2
  40,
  // Rata 3
  40,
  // Rata 4
  [
    { name: 'Merkityt paikat', lane_count: 4 },
    { name: 'Merkitsemättömät paikat', lane_count: 20 }
  ],
  // Rata 5
  4,
  // Rata 6
  60,
  // Rata 7
  25
];

exports.seed = async function(knex) {
  const tracks = await knex('track').orderBy('id');

  if (tracks.length !== sectionsPerTrack.length) {
    throw new Error(
      `Track section seed expects ${sectionsPerTrack.length} tracks, ` +
      `found ${tracks.length}. Update sectionsPerTrack to match.`
    );
  }

  const sections = tracks.flatMap((track, i) => {
    const layout = sectionsPerTrack[i];
    const blocks = Array.isArray(layout) ? layout : [{ lane_count: layout }];

    return blocks.map((block, position) => ({
      track_id: track.id,
      position: position + 1,
      lane_count: block.lane_count,
      // A block's description states its size; a whole-track section
      // inherits the track's own description.
      description: block.name ? `${block.lane_count} paikan lohko` : track.description,
      name: block.name || track.name
    }));
  });

  await knex('track_section').insert(sections);
};
