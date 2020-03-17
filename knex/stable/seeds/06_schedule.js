const moment = require('moment')

const schedule = [
  {
    date: '2020-03-02'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-03'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-04'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '20:00'
    }
  },
  {
    date: '2020-03-05'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-06'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-07'
    , data: {
      supervisor:true
      , open:'10:00'
      , close: '16:00'
    }
  },
  {
    date: '2020-03-09'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-10'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-11'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '20:00'
    }
  },
  {
    date: '2020-03-12'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-16'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-17'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-18'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '20:00'
    }
  },
  {
    date: '2020-03-19'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-20'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-21'
    , data: {
      supervisor:true
      , open:'10:00'
      , close: '16:00'
    }
  },
  {
    date: '2020-03-23'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-24'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-25'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '20:00'
    }
  },
  {
    date: '2020-03-26'
    , data: {
      supervisor:false
      , open:'16:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-03-28'
    , data: {
      supervisor:true
      , open:'10:00'
      , close: '16:00'
    }
  },
  {
    date: '2020-04-06'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-07'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-08'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-09'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-11'
    , data: {
      supervisor:true
      , open:'10:00'
      , close: '16:00'
    }
  },
  {
    date: '2020-04-14'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-15'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-16'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-20'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-21'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-22'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-23'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-27'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-28'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-29'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  },
  {
    date: '2020-04-30'
    , data: {
      supervisor:true
      , open:'17:00'
      , close: '21:00'
    }
  }
]

exports.seed = async function(knex) {
  const supervisor_id = (await knex('supervisor')).pop().user_id

  return knex('range_reservation')
    .where({
      available: true
    })
    .select(['id', 'date'])
    .then(reservations => {
      return Promise.all(
        reservations.map(reservation => {
          const day = schedule
                .filter(day => moment(reservation.date).format('YYYY-MM-DD') === day.date)
                .pop()
          if(day.data.supervisor) {
            day.data.supervisor_id = supervisor_id
          }
          day.data.range_reservation_id = reservation.id
          delete day.data.supervisor
          
          return knex('scheduled_range_supervision')
            .insert(day.data)
        }))
    })
}
