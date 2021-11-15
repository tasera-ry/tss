const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

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
      n_total += m.members + m.supervisors;
    });
    console.log(n_total, n_supervisions);
    var supervisions = [];
    sum = 0;
    members.forEach(function(m) {
      //console.log(m);
      const a = (m.members + m.supervisors) * n_supervisions / n_total;
      const temp = Math.round(a);
      console.log(m.id, temp);
      sum += a;
      for (i = 0; i < temp; i++) {
        supervisions.push(m.id);
      }
    });
    // console.log(supervisions);
    console.log("number of supervisions: " + n_supervisions);
    console.log("number of raffled supervisions: " + supervisions.length);
    console.log("sum: " + sum);
    const str = dates[0].date
    const day = new Date('str');
    return {"available days in 2021": n_supervisions};
  }
};

module.exports = service;