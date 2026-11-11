const _ = require('lodash');

// Rows as stored, including `date`, which the real model filters on but does
// not return.
let reservations = [];

const model = {
  read: async function readReservation(key) {
    return reservations
      .filter(reservation =>
        Object.keys(key).every(field => reservation[field] === key[field])
      )
      .map(reservation => _.omit(reservation, 'date'));
  },

  seed: async function seed(rows) {
    reservations = [...rows];
  },

  clear: async function clear() {
    reservations = [];
  }
};

module.exports = model;
