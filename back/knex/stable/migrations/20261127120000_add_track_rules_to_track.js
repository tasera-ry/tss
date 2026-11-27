// B8 (#455): standing rules per track as on/off columns, edited on the Edit
// tracks page (#462); the track view shows their fixed, translated text.
// Defaults false. Existing databases get the customer's rules (7.10.2026) by
// track name, as the requires_range_officer migration does: .22LR only on
// track 6, no shooting in the dark on tracks 5 and 6.

exports.up = async function(knex) {
  await knex.schema.alterTable('track', (track) => {
    track.boolean('only_22lr').notNullable().defaultTo(false);
    track.boolean('daylight_only').notNullable().defaultTo(false);
  });

  await knex('track').where('name', 'Rata 6').update({ only_22lr: true });
  await knex('track')
    .whereIn('name', ['Rata 5', 'Rata 6'])
    .update({ daylight_only: true });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('track', (track) => {
    track.dropColumn('only_22lr');
    track.dropColumn('daylight_only');
  });
};
