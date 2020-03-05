const knex = require('../knex/knex')

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
      //works with localhost:3000/api/date/2020-02-20/track/Shooting Track 0
      (
        knex
          .from('range')
          .select('range.name as rangeName','track.name','track.description','supervisor_id as rangeOfficer','track_supervisor as trackOfficer','track_supervision.notice as trackNotice')
          .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
          .join('track', 'range.id', '=', 'track.range_id')
          .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
          .leftJoin('track_supervision', 'scheduled_range_supervision.id', '=', 'scheduled_range_supervision_id')
          .where('date', req.params.date)
          //atm track name needs to be exact e.g. 'Shooting Track 0'
          .where('track.name', req.params.id)
          //TODO remove hard coded range below
          .where('range.id', 6)
          
          //TODO test below
          //track supervision has multiple events and the most recent one is the correct you want rest are for history

          .then((rows) => {
            console.log(rows);
            const trackInfo = rows.pop()
            console.log(trackInfo);
            
            let roState = (trackInfo.rangeOfficer !== null) ? true : false;
            let toState = (trackInfo.trackOfficer !== null) ? true : false;
            console.log(roState);
            var trackObj = {trackName:trackInfo.name,description:trackInfo.description,trackOfficer:toState,rangeOfficer:toState,trackNotice:trackInfo.trackNotice};
          
            res.status(200).json({
              track: trackObj
            });
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