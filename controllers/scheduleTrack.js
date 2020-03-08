const knex = require('../knex/knex')
const config = require("../config/config");

/*
*  Get track status for a day
*/
exports.trackInfoForDay = async (req, res) => {
  //Selecting track-status for a specific day from the DB and sending it to the front end
  //date/:date/track/:id
  console.log("SCHEDULE_TRACK "+req.params.date);
  console.log("SCHEDULE_TRACK "+req.params.id);
  let date = new Date(req.params.date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    if(req.params.id !== undefined){
      //get single track
      //works with localhost:3000/api/date/2020-02-20/track/Shooting Track 1
      (
        knex          
          .with('getTOState', knex.raw(
            'select * '+
            'from track_supervision '+
            'inner join track on track.id = track_supervision.track_id '+
            'where track.name=? '+
            'order by updated_at',
            [req.params.id])
          )
          .select(
            'range.name as rangeName',
            'track.name','track.description',
            'scheduled_range_supervision.supervisor_id as rangeOfficer',
            'getTOState.track_supervisor as trackOfficer',
            'getTOState.notice as trackNotice',
            //'getTOState.*'
          )
          .from('range')
          .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
          .join('track', 'range.id', '=', 'track.range_id')
          .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
          .leftJoin('getTOState' ,'scheduled_range_supervision.id' , '=', 'getTOState.scheduled_range_supervision_id')
          .where('date', req.params.date)
          //atm track name needs to be exact e.g. 'Shooting Track 1'
          .where('track.name', req.params.id)
          //TODO remove hard coded range below
          .where('range.id', config.dev.range_id)

          .then((rows) => {
            console.log("Got rows: "+rows.length);
            if(rows.length === 0){
              res.status(400).json({
                err: "No results found. Either date or track name not found."
              });
            }
            else {
              console.log(rows);
              const trackInfo = rows.pop()
              console.log(trackInfo);
              
              let roState = (trackInfo.rangeOfficer !== null) ? true : false;
              let toState = (trackInfo.trackOfficer !== null && trackInfo.trackOfficer !== 'absent') ? true : false;
              console.log(roState);
              var trackObj = {trackName:trackInfo.name,description:trackInfo.description,trackOfficer:toState,rangeOfficer:roState,trackNotice:trackInfo.trackNotice};
            
              res.status(200).json({
                track: trackObj
              });
            }
          })
      )
    }
    else{
      //TODO all tracks
      res.status(400).json({
        err: "get all not implemented"
      });
    }
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};

/*
*  Add track status for a day
*/
exports.addTrackInfoForDay = async (req, res) => {
  //adding track-specific info for a day to the DB
  //date/:date/track/:id
  console.log("SCHEDULE_TRACK "+req.params.date);
  console.log("SCHEDULE_TRACK "+req.params.id);
  console.log("SCHEDULE_TRACK "+"body "+ req.body)
  
  //TODO
  
  res.status(200).json({
    added: true
  });
}

/*
* Delete track status from day
*/
exports.deleteTrackInfoForDay = async (req, res) => {
  //removing track's day-specific info from the DB (in UI day turns white)
  //date/:date/track/:id
  console.log("SCHEDULE_TRACK "+req.params.date);
  console.log("SCHEDULE_TRACK "+req.params.id);
  
  //TODO
  
  res.status(200).json({
    deleted: true
  });
}

/*
* Delete track status from day
*/
exports.updateTrackInfoForDay = async (req, res) => {
  //updating a track's info in the DB
  //date/:date/track/:id
  console.log("SCHEDULE_TRACK "+req.params.date);
  console.log("SCHEDULE_TRACK "+req.params.id);
  
  //TODO
  
  res.status(200).json({
    updated: true
  });
}