/*
*  Get track status for a day
*/
exports.trackInfoForDay = async (req, res) => {
  //Selecting track-status for a specific day from the DB and sending it to the front end
  //date/:date/track/:id
  console.log("SCHEDULE_TRACK "+req.params.date);
  console.log("SCHEDULE_TRACK "+req.params.id);
  
  //TODO
  //with id single track, without all
  
  let date = new Date(req.params.date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
  //track where date && id
    var trackObj = {name:"Kivääri",status:1,info:"???",trackOfficer:true};
  }
  else{
    date = Date.now()
    
    var trackObj = {name:"Pistooli",status:2,info:"???",trackOfficer:false};
  }
  
  res.status(200).json({
    track: trackObj
  });
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