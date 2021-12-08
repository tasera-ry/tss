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
    const weekendratio = 2;
    // if range_id is undefined assign 1 to it
    const range_id = info.range_id == undefined ? 1 : info.range_id;
    const dates = info.dates;
    // split dates to weekdays and weekends
    let weekdays = [];
    let weekends = [];
    for (i = 0; i < dates.length; i++) {
      let day = new Date(dates[i]).getDay();
      if (day == 5 || day == 6) {
        weekends.push(dates[i]);
      } else {
        weekdays.push(dates[i]);
      }
    }

    let members = await models.members.read({ raffle: true }, ['user_id', 'name', 'members', 'supervisors', 'raffle']);

    const n_weekendsupervisions = weekends.length;
    const n_weekdaysupervisions = weekdays.length;
    // Count the number of supervisors and set supervisions to 0
    let n_total = 0;
    members.forEach(function(m) {
      n_total += (m.members + m.supervisors);
      m.weekendsupervisions = 0;
      m.weekdaysupervisions = 0;
    });
    
    // Start by raffling weekend supervisions
    let current_weekendsupervisions = 0;
    sum = 0;
    members.forEach(function(m) {
      const n = Math.round((m.members + m.supervisors) / n_total * n_weekendsupervisions);
      current_weekendsupervisions += n;
      m.weekendsupervisions += n;
      m.ratio = (m.weekendsupervisions * weekendratio + m.weekdaysupervisions)/(m.members + m.supervisors);
    });

    // trim extra weekendsupervisions
    if ( current_weekendsupervisions > n_weekendsupervisions) {
      while (0 < current_weekendsupervisions - n_weekendsupervisions) {
        members.sort(compare).reverse();
        current_weekendsupervisions--;
        members[0].weekendsupervisions --;
        // update ratio to reflect new supervisions
        members[0].ratio = (members[0].weekendsupervisions * weekendratio + members[0].weekdaysupervisions)/(members[0].members + members[0].supervisors)
      }
    }
    //add missing weekendsupervisions
    if ( current_weekendsupervisions < n_weekendsupervisions) {
      while (0 < n_weekendsupervisions - current_weekendsupervisions) {
        members.sort(compare);
        current_weekendsupervisions++;
        members[0].weekendsupervisions ++;
        members[0].ratio = members[0].weekendsupervisions/(members[0].members + members[0].supervisors)
      }
    }

    // Now repeat this all for weekdays
    let current_weekdaysupervisions = 0;
    sum = 0;
    members.forEach(function(m) {
      const n = Math.round((m.members + m.supervisors) / n_total * n_weekdaysupervisions);
      current_weekdaysupervisions += n;
      m.weekdaysupervisions += n;
      m.ratio = (m.weekdaysupervisions * weekendratio + m.weekdaysupervisions)/(m.members + m.supervisors);
    });

    // trim extra weekdaysupervisions
    if ( current_weekdaysupervisions > n_weekdaysupervisions) {
      while (0 < current_weekdaysupervisions - n_weekdaysupervisions) {
        members.sort(compare).reverse();
        current_weekdaysupervisions--;
        members[0].weekdaysupervisions --;
        // update ratio to reflect new supervisions
        members[0].ratio = (members[0].weekdaysupervisions * weekendratio + members[0].weekdaysupervisions)/(members[0].members + members[0].supervisors)
      }
    }
    //add missing weekdaysupervisions
    if ( current_weekdaysupervisions < n_weekdaysupervisions) {
      while (0 < n_weekdaysupervisions - current_weekdaysupervisions) {
        members.sort(compare);
        current_weekdaysupervisions++;
        members[0].weekdaysupervisions ++;
        members[0].ratio = members[0].weekdaysupervisions/(members[0].members + members[0].supervisors)
      }
    }

    // add counted supervisions to list
    var supervisions = [];
    members.forEach(function(m) {
      for (i = 0; i < m.weekendsupervisions; i++) {
        supervisions.push(m);
      }for (i = 0; i < m.weekdaysupervisions; i++) {
        supervisions.push(m);
      }
    });
    shuffleArray(supervisions);

    var raffle = [];

    for (i = 0; i < weekends.length; i++) {
      var temp = {
        "date": weekends[i],
        "range_id": range_id,
        "user_id": supervisions[i].user_id,
        "name": supervisions[i].name
      }
      raffle.push(temp);
    }

    //raffle weekdays
    for (i = 0; i < weekdays.length; i++) {
      var temp = {
        "date": weekdays[i],
        "range_id": range_id,
        "user_id": supervisions[i].user_id,
        "name": supervisions[i].name
      }
      raffle.push(temp);
    }

    //Log results for inspection
    /*
    members.forEach(function(m) {
      console.log(Number(m.ratio).toFixed(2), m.weekdaysupervisions, m.weekendsupervisions, m.name, m.user_id);
    });
    */

    return {raffle};
  }
};

module.exports = service;