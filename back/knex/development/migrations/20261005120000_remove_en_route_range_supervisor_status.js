const TABLES = ['range_supervision', 'range_supervision_history'];
const TYPE = 'range_supervisor_not_confirmed';

// Recreates the enum with the given values. Existing 'en route' rows are
// mapped to 'confirmed'. Done with ALTER COLUMN ... TYPE so the history
// triggers on range_supervision do not fire.
async function replaceEnum(knex, values) {
  const list = values.map((v) => `'${v}'`).join(', ');
  await knex.raw(`alter type ${TYPE} rename to ${TYPE}_old`);
  await knex.raw(`create type ${TYPE} as enum (${list})`);
  for (const table of TABLES) {
    await knex.raw(`alter table ${table} alter column range_supervisor drop default`);
    await knex.raw(`
      alter table ${table}
      alter column range_supervisor type ${TYPE}
      using (case when range_supervisor::text = 'en route' then 'confirmed' else range_supervisor::text end)::${TYPE}
    `);
    await knex.raw(`alter table ${table} alter column range_supervisor set default 'absent'`);
  }
  await knex.raw(`drop type ${TYPE}_old`);
}

exports.up = function (knex) {
  return replaceEnum(knex, ['absent', 'confirmed', 'not confirmed', 'present']);
};

// Restores the 'en route' enum value. Rows that were changed to 'confirmed'
// in up() cannot be told apart from other confirmed rows, so they stay
// 'confirmed'.
exports.down = function (knex) {
  return replaceEnum(knex, ['absent', 'confirmed', 'not confirmed', 'en route', 'present']);
};
