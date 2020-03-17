exports.seed = async function(knex) {
  const schedule = await knex('scheduled_range_supervision')
        .whereNotNull('supervisor_id')
        .select('id')
  return Promise.all(schedule.map(day => {
    return knex('range_supervision')
      .insert({
        scheduled_range_supervision_id: day.id
        , range_supervisor: 'present'
      })
  }))
}
