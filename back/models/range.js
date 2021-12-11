const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex')); 

const model = {
  readAllRanges: async function readAllRanges() {
    return knex('range')
      .select();
  }
};

module.exports = model;
