const knex = require('../knex/knex')
const config = require("../config/config");
const moment = require("moment-timezone");

/*
*  Get date info
*/
exports.date = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log("SCHEDULE_DATE "+date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    
    //track defaults when range closed
    async function tracks() {
      let rows = await knex
        .from('range')
        .select('track.name')
        .join('track','track.range_id','=','range.id')
        .where('range.id', config.development.range_id)
        .orderBy('track.name','asc')
      let trackList = []
      while(rows.length !== 0) {
        const trackInfo = rows.pop()
        //by default closed and correct state set afterwards
        let trackObj = {name:trackInfo.name,status:"closed"};
        trackList.push(trackObj)
      }
      return trackList;
    }
    const defaultTracks = await tracks();
    
    //get specific date
    //localhost:3000/api/date/2020-02-20
    (
      knex
        .from('range')
        .select(
          'range.name as rangeName',
          'range_reservation.available',
          'supervisor_id as rangeOfficer',
          'track_supervisor as trackOfficer',
          'track_supervision.notice as trackNotice',
          'track.name',
          'track.description'
        )
        .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
        //left join since range if not available would return nothing otherwise
        .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
        .leftJoin('track_supervision', 'scheduled_range_supervision.id', '=', 'scheduled_range_supervision_id')
        .leftJoin('track', 'track_supervision.track_id', '=', 'track.id')
        .where('date', req.params.date)
        //TODO remove hard coded range below
        .where('range.id', config.development.range_id)

        .then((rows) => {
          if(rows.length === 0){
            res.status(400).json({
              err: "No results found."
            });
          }
          else {
            //console.log(rows);
            console.log("SCHEDULE_DATE rows length "+rows.length)
            
            let trackList = [];
            let roState;
            
            while(rows.length !== 0) {
              const trackInfo = rows.pop()
              
              roState = (trackInfo.rangeOfficer !== null) ? true : false;
              let toState = (trackInfo.trackOfficer !== null && trackInfo.trackOfficer !== 'absent') ? true : false;
              
              let status;
              //track officer present == open
              if(toState){
                status="open";
              }
              //TODO is this right? this would mean range not available == track closed
              else if(trackInfo.available === false){
                status="closed";
              }
              else {
                status="trackofficer unavailable"
              }
              
              var trackObj = {name:trackInfo.name,status:status};
              trackList.push(trackObj)
            }
            
            //on each defaulttracks array item runs map function to add correct status from the new array
            //a.k.a. gets defaults adds possible status on top
            const combinedTracks = defaultTracks.map((item, i, arr) => ({
              ...item,
              ...trackList.find((findItem) => findItem.name === item.name)
            }));

            console.log("SCHEDULE_DATE tracks",combinedTracks)
            
            combinedTracks.reverse();
            trackListObj = {date:date,rangeOfficer:roState,tracks:combinedTracks};
            res.status(200).json(trackListObj);
          }
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
        .where('range.id', config.development.range_id)
        .orderBy('date', 'asc')
        
        .then((rows) => {
          if(rows.length === 0){
            res.status(400).json({
              err: "No results found."
            });
          }
          else {
            console.log(rows);
            
            let dayList = [];
            let roState;
            
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
              
              //parse gotten date as GMT time and change to GMT+2
              let date = moment(dayInfo.date).tz("Europe/London");
              date = date.tz("Europe/Helsinki").format("YYYY-MM-DD");
              
              var dayObj = {date:date,status:status};
              dayList.push(dayObj);
            }

            //TODO guarantee length 7?

            dayList.reverse();
            dayListObj = {weekNum:weekNum,weekBegin:begin,weekEnd:end,days:dayList};
            res.status(200).json(dayListObj);
          }
        })
    )
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};