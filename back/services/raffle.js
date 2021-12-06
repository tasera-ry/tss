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

function compare( a, b ) {
  if ( a.ratio < b.ratio ) {
    return -1;
  }
  if ( a.ratio > b.ratio ) {
    return 1;
  }
  if (a.members < b.members) {
      return -1
  }
  if ( a.members > b.members ) {
    return 1;
  }
  return 0;
}


const service = {
  /**
   * 
   * @param {*} info 
   * @returns 
   */
  create: async function createRaffle(info) {
    const range_id = info.range_id;
    const dates = info.dates;
    //const dates = await models.reservation.read({ available: true }, [], '2021-01-01', '2021-12-31');
    //console.log(dates);
    let members = await models.members.read({ raffle: true }, ['user_id', 'name', 'members', 'supervisors', 'raffle']);
    const n_supervisions = dates.length;
    // Count the number of supervisors
    let n_total = 0;
    members.forEach(function(m) {
      n_total += (m.members + m.supervisors);
    });
    
    let current_supervisions = 0;
    sum = 0;
    members.forEach(function(m) {
      const n = Math.round((m.members + m.supervisors) / n_total * n_supervisions);
      current_supervisions += n;

      m.supervisions = n;
      m.ratio = n/(m.members + m.supervisors);
    });


    // trim extra supervisions
    if ( current_supervisions > n_supervisions) {
      while (0 < current_supervisions - n_supervisions) {
        members.sort(compare).reverse();
        current_supervisions--;
        members[0].supervisions--;
        members[0].ratio = members[0].supervisions/(members[0].members + members[0].supervisors)
      }
    }
    
    //add missing supervisions
    if ( current_supervisions < n_supervisions) {
      while (0 < n_supervisions - current_supervisions) {
        members.sort(compare);
        current_supervisions++;
        members[0].supervisions++;
        members[0].ratio = members[0].supervisions/(members[0].members + members[0].supervisors)
      }
    }
    /*
    members.forEach(function(m) {
      console.log(m.members + m.supervisors, m.supervisions, m.ratio);
    });
    */

    var supervisions = [];
    members.forEach(function(m) {
      for (i = 0; i < m.supervisions; i++) {
        supervisions.push(m);
      }
    });
    
    shuffleArray(supervisions);
    //console.log(dates);
    //console.log(supervisions);
    //console.log(dates.length, supervisions.length);

    var raffle = [];

    for (i = 0; i < dates.length; i++) {
      var temp = {
        "date": dates[i],
        "range_id": range_id,
        "user_id": supervisions[i].user_id,
        "name": supervisions[i].name
      }
      raffle.push(temp);
    }

    return {raffle};
  }
};

module.exports = service;