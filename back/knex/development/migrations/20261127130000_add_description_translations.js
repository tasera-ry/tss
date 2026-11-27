// #462 stretch goal: Swedish and English versions of the track's description
// and short description and of a section's description, edited on the Edit
// tracks page. The Finnish text stays in the existing columns; a translation
// left empty (null) falls back to it.

exports.up = async function(knex) {
  await knex.schema.alterTable('track', (track) => {
    track.string('description_sv').nullable();
    track.string('description_en').nullable();
    track.string('short_description_sv').nullable();
    track.string('short_description_en').nullable();
  });
  await knex.schema.alterTable('track_section', (section) => {
    section.string('description_sv').nullable();
    section.string('description_en').nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('track', (track) => {
    track.dropColumn('description_sv');
    track.dropColumn('description_en');
    track.dropColumn('short_description_sv');
    track.dropColumn('short_description_en');
  });
  await knex.schema.alterTable('track_section', (section) => {
    section.dropColumn('description_sv');
    section.dropColumn('description_en');
  });
};
