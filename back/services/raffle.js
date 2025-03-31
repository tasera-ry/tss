const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

// this compare function ranks clubs by the thier currently raffled supervisions
// if supervisions are equal the one with more associations gets more supervisions
function compare( a, b ) {
  if ( a.ratio < b.ratio ) { return -1; }
  if ( a.ratio > b.ratio ) { return 1; }
  if ( a.members + a.associations < b.members + b.associations ) { return -1; }
  if ( a.members + a.associations > b.members + b.associations ) { return 1; }
  if ( a.members < b.members ) { return -1; }
  if ( a.members > b.members ) { return 1; }
  return 0;
}

// compare function for debugging
function compare_size( a, b ) {
  if ( a.members + a.associations < b.members + b.associations ) { return -1; }
  if ( a.members + a.associations > b.members + b.associations ) { return 1; }
  return 0;
}

// function to calculate the current ratio for supervisions to members
function calculate_ratio( m ) {
  // weekend to weekday weighting
  const weekendratio = 2;  
  return (m.weekendsupervisions * weekendratio + m.weekdaysupervisions)/(m.members + m.associations);
}

const service = {
  /**
   * 
   * @param {*} info 
   * @returns 
   */
  create: async function createRaffle(info) {
    // if range_id is undefined assign 1 to it
    const range_id = info.range_id == undefined ? 1 : info.range_id;
    const dates = info.dates;
    // split dates to weekdays and weekends
    let weekdays = [];
    let weekends = [];
    for (let i = 0; i < dates.length; i++) {
      let day = new Date(dates[i]).getDay();
      if (day == 0 || day == 6) {
        weekends.push(dates[i]);
      } else {
        weekdays.push(dates[i]);
      }
    }

    let members = await models.members.read({ raffle: true }, ['user_id', 'name', 'members', 'associations', 'raffle']);

    const n_weekendsupervisions = weekends.length;
    const n_weekdaysupervisions = weekdays.length;
    // Count the number of associations and set supervisions to 0
    let n_total = 0;
    members.forEach(function(m) {
      n_total += (m.members + m.associations);
      m.weekendsupervisions = 0;
      m.weekdaysupervisions = 0;
    });
    
    // Raffle initial weekday and weekend supervisions
    let current_weekendsupervisions = 0;
    let current_weekdaysupervisions = 0;
    members.forEach(function(m) {
      // weekend
      const weekendsupervisions = Math.round((m.members + m.associations) / n_total * n_weekendsupervisions);
      current_weekendsupervisions += weekendsupervisions;
      m.weekendsupervisions += weekendsupervisions;
      // weekday
      const weekdaysupervisions = Math.round((m.members + m.associations) / n_total * n_weekdaysupervisions);
      // if the club is so small that they didnt get any weekday supervisions assign at least one to them
      if ( weekdaysupervisions == 0 ) {
        current_weekdaysupervisions += 1;
        m.weekdaysupervisions += 1;
      } else {
        current_weekdaysupervisions += weekdaysupervisions;
        m.weekdaysupervisions += weekdaysupervisions;
      }
      m.ratio = calculate_ratio(m);
    });

    // trim extra weekendsupervisions
    if ( current_weekendsupervisions > n_weekendsupervisions) {
      while (0 < current_weekendsupervisions - n_weekendsupervisions) {
        members.sort(compare).reverse();
        current_weekendsupervisions--;
        members[0].weekendsupervisions --;
        // update ratio to reflect new supervisions
        members[0].ratio = calculate_ratio(members[0]);
      }
    }
    //add missing weekendsupervisions
    if ( current_weekendsupervisions < n_weekendsupervisions) {
      while (0 < n_weekendsupervisions - current_weekendsupervisions) {
        members.sort(compare);
        current_weekendsupervisions++;
        members[0].weekendsupervisions ++;
        members[0].ratio = calculate_ratio(members[0]);
      }
    }

    // trim extra weekdaysupervisions
    if ( current_weekdaysupervisions > n_weekdaysupervisions) {
      while (0 < current_weekdaysupervisions - n_weekdaysupervisions) {
        members.sort(compare).reverse();
        let i = 0;
        /* this is to remove the problem that sometimes the raffle tries to allocate negative weekday
        supervisions to balance weekend supervision with low number of members */
        for ( ;; ) {
          if ( members[i].weekdaysupervisions > 0) {
            current_weekdaysupervisions--;
            members[i].weekdaysupervisions --;
            // update ratio to reflect new supervisions
            members[i].ratio = calculate_ratio(members[i]);
            break;
          }
          i++;
        }
      }
    }
    //add missing weekdaysupervisions
    if ( current_weekdaysupervisions < n_weekdaysupervisions) {
      while (0 < n_weekdaysupervisions - current_weekdaysupervisions) {
        members.sort(compare);
        current_weekdaysupervisions++;
        members[0].weekdaysupervisions ++;
        members[0].ratio = calculate_ratio(members[0]);
      }
    }

    // add counted supervisions to list
    var supervisions = [];
    members.forEach(function(m) {
      for (let i = 0; i < m.weekendsupervisions; i++) {
        supervisions.push(m);
      }
      for (let i = 0; i < m.weekdaysupervisions; i++) {
        supervisions.push(m);
      }
    });

    shuffleArray(supervisions);

    let raffle = [];

    for (let i = 0; i < weekends.length; i++) {
      let temp = {
        'date': weekends[i],
        'range_id': range_id,
        'user_id': supervisions[i].user_id,
        'name': supervisions[i].name
      };
      raffle.push(temp);
    }

    //raffle weekdays
    for (let i = 0; i < weekdays.length; i++) {
      let temp = {
        'date': weekdays[i],
        'range_id': range_id,
        'user_id': supervisions[weekends.length + i].user_id,
        'name': supervisions[weekends.length + i].name
      };
      raffle.push(temp);
    }
    
    raffle.sort(function (a,b) {
      if (new Date(a.date) > new Date(b.date)) { return -1; }
      if (new Date(a.date) < new Date(b.date)) { return 1; }
      return 0;
    });
    //Log results for inspection
    /*
    console.log(raffle);
    members.sort(compare_size);
    console.log('members, ratio, weekdaysupervisions, weekendsupervisions, user_id');
    members.forEach(function(m) {
      console.log(m.associations + m.members, Number(m.ratio).toFixed(2), m.weekdaysupervisions, m.weekendsupervisions, m.name, m.user_id);
    });
    console.log(raffle.length, supervisions.length);
    */
    return {raffle};
  }
};

module.exports = service;