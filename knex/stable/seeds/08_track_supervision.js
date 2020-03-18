exports.seed = async function(knex) {
  const tracks = await knex('track')
        .select('id')

  const schedule = await knex('scheduled_range_supervision')
        .whereNotNull('supervisor_id')
        .select('id')

  let supervisions = []

  schedule.forEach(({ id }) => {
    tracks.forEach(track => {
      supervisions.push({
        scheduled_range_supervision_id: id
        , track_id: track.id
        , track_supervisor: 'present'
      })
    })
  })

  return knex('track_supervision')
    .insert(supervisions)
}
