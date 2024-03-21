const _ = require('lodash');
const ora = require('ora');

exports.seed = async function (knex) {
    const associations = await knex.select('id').from('user').where('role', 'association');
    const rangeofficers = await knex.select('id').from('user').where('role', 'rangeofficer');

    const associationRangeOfficers = [];
    associations.forEach((association) => {
      // Randomly select range officers for each association
      const selectedRangeOfficers = _.sampleSize(rangeofficers, _.random(1, 3)); // Adjust the range as needed

      selectedRangeOfficers.forEach((rangeofficer) => {
        associationRangeOfficers.push({
          association_id: association.id,
          rangeofficer_id: rangeofficer.id
      });
    });
  });

    // Insert data into the association_rangeofficers table
    const insertAssociationRangeOfficers = await knex('association_rangeofficers').insert(associationRangeOfficers);

    ora.promise(
      Promise.resolve(insertAssociationRangeOfficers),
       'Inserting association range officers'
    );
};
