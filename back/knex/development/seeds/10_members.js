exports.seed = async function (knex) {
  // get all supervisor users
  const users = await knex('user').where({ role: 'supervisor' }).select('id');
  // generate random numbers for ranging from 1-100 for members & 1-10 for supervisors
  const members = users.map(({ id }) => ({
    user_id: id,
    members: Math.floor(Math.random() * 100) + 1,
    supervisors: Math.floor(Math.random() * 10) + 1,
    raffle: true,
  }));

  return knex('members')
    .del()
    .then(function () {
      // insert seed entries
      return knex('members').insert(members);
    });
};
