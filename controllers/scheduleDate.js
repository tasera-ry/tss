const knex = require('../knex/knex')
const moment = require("moment");

/*
*  Get date info
*/
exports.date = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log("SCHEDULE_DATE "+date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    //get specific date
    //localhost:3000/api/date/2020-02-20
    (
      knex
        .from('range')
        .select('range.name as rangeName','track.name','track.description','supervisor_id as rangeOfficer','track_supervisor as trackOfficer','track_supervision.notice as trackNotice')
        .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
        .join('track', 'range.id', '=', 'track.range_id')
        .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
        .leftJoin('track_supervision', 'scheduled_range_supervision.id', '=', 'scheduled_range_supervision_id')
        .where('date', req.params.date)
        //TODO remove hard coded range below
        .where('range.id', 6)

        .then((rows) => {
          console.log(rows);
          console.log(rows.length)
          
          let trackList = [];
          let roState;
          
          var i;
          while(rows.length !== 0) {
            const trackInfo = rows.pop()
            console.log(trackInfo);
            
            roState = (trackInfo.rangeOfficer !== null) ? true : false;
            let toState = (trackInfo.trackOfficer !== null) ? true : false;
            console.log(roState);
            
            let status;
            //track officer present == open
            if(toState){
              status="open";
            }
            //TODO notice == closed?
            else if(trackInfo.trackNotice !== null){
              status="closed";
            }
            else {
              status="trackofficer unavailable"
            }
            
            var trackObj = {name:trackInfo.name,status:status};
            trackList.push(trackObj)
          }
          console.log(trackList);
          trackList.reverse();
          trackListObj = {date:date,rangeOfficer:roState,tracks:trackList};
          res.status(200).json(trackListObj);
        })
    )
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};

/*
* Add date with body params
*/
exports.addDate = async (req, res) => {
  console.log("SCHEDULE_DATE "+req.params.date)
  console.log("SCHEDULE_DATE "+"body "+ req.body)
  
  //TODO
  
  res.status(200).json({
    added: true
  });
}

/*
* Delete a date
*/
exports.deleteDate = async (req, res) => {
  console.log("SCHEDULE_DATE "+req.params.date)
  
  //TODO
  
  res.status(200).json({
    deleted: true
  });
}

/*
* Update a date
*/
exports.updateDate = async (req, res) => {
  console.log("SCHEDULE_DATE "+req.params.date)
  
  //TODO
  
  res.status(200).json({
    updated: true
  });
}

/*
*  Get week info
*/
exports.week = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log("SCHEDULE_WEEK "+date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    let weekNum = moment(req.params.date, "YYYYMMDD").isoWeek();
    let begin = moment(req.params.date, "YYYYMMDD").startOf('isoWeek').format('YYYY-MM-DD');
    let end = moment(req.params.date, "YYYYMMDD").endOf('isoWeek').format('YYYY-MM-DD');
    console.log("WEEK "+weekNum+ " BEGIN "+begin+ " END "+end);
    //get specific week
    //localhost:3000/api/week/2020-02-20
    (
      knex
        .from('range')
        .select('range.name as rangeName','range_reservation.available','supervisor_id as rangeOfficer','range_reservation.date')
        .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
        .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
        .whereBetween('date', [begin, end])
        //TODO remove hard coded range below
        .where('range.id', 6)
        .orderBy('date', 'asc')
        
        .then((rows) => {
          console.log(rows);
          
          let dayList = [];
          let roState;
          
          var i;
          while(rows.length !== 0) {
            const dayInfo = rows.pop();
            
            roState = (dayInfo.rangeOfficer !== null) ? true : false;
            
            let status;
            //range officer present == open
            if(roState){
              status="open";
            }
            //available false
            else if(!dayInfo.available){
              status="closed";
            }
            else if(status==="orange"){
              //TODO 4th orange color?
              status="coming";
            }
            //available true
            else {
              status="range officer unavailable";
            }
            
            var dayObj = {date:dayInfo.date,status:status};
            dayList.push(dayObj);
          }

          //TODO guarantee length 7?

          dayList.reverse();
          dayListObj = {weekNum:weekNum,weekBegin:begin,weekEnd:end,days:dayList};
          res.status(200).json(dayListObj);
        })
    )
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};