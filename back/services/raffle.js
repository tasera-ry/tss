const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');
const { shuffle } = require('lodash');

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


const service = {
  /**
   * 
   * @param {*} info 
   * @returns 
   */
  create: async function createRaffle(info) {
    // console.log(info);
    const dates = await models.reservation.read({ available: true }, [], '2021-01-01', '2021-12-31');
    const members = await models.members.read({ raffle: true });
    const n_supervisions = dates.length;
    // Count the number of supervisors
    var n_total = 0;
    members.forEach(function(m) {
      n_total += (m.members + m.supervisors);
    });
    console.log(n_total, n_supervisions);
    var supervisions = [];
    sum = 0;
    members.forEach(function(m) {
      //console.log(m);
      const n = Math.round((m.members + m.supervisors) / n_total * n_supervisions);
      //supervisions.push(r);
      for (i = 0; i < n; i++) {
        supervisions.push(m.id);
      }
    });
    console.log(supervisions);
    shuffleArray(supervisions);
    if ( supervisions.length > n_supervisions) {
      var temp = [];
      for ( i = 0; i < supervisions.length - n_supervisions; i++) {
        temp.push(supervisions.pop());
      }
      console.log("removed: " + temp);
    }
    if ( supervisions.length < n_supervisions) {
      var temp = [];
      for ( i = 0; i < n_supervisions - supervisions.length; i++) {
        const id = supervisions[Math.floor(Math.random()*supervisions.length)];
        temp.push(id);
      }
      console.log("temp to concat: " + temp);
      supervisions = supervisions.concat(temp);
    }
    console.log(supervisions);
    console.log("number of supervisions: " + n_supervisions);
    console.log("number of raffled supervisions: " + supervisions.length);
    const str = dates[0].date
    const day = new Date('str');

    /** return { [
      {
        "date": "01-01-1000",
        "id": 12,
        "name": "pamauttelijat"
      },

    ] } */
    return {"available days in 2021": n_supervisions};
  }
};

module.exports = service;