// B7 (#464): track.requires_range_officer (boolean, default true). False only
// for track 6, the 50 m .22LR range, which may open without a range officer
// on site (Pasi Autio, 12.10.2026). Existing databases get the exception
// applied by name, the same key the section backfill uses; elsewhere the
// column default applies.

exports.up = async function(knex) {
  await knex.schema.alterTable('track', (track) => {
    track.boolean('requires_range_officer').notNullable().defaultTo(true);
  });

  await knex('track')
    .where('name', 'Rata 6')
    .update({ requires_range_officer: false });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('track', (track) => {
    track.dropColumn('requires_range_officer');
  });
};
