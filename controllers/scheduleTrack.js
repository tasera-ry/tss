/*
*  Get track status for a day
*/
exports.trackInfoForDay = async (req, res) => {
  //Selecting the day's track-status from the DB and sending it to the front end
  //date/:date/track/:id
  console.log(req.params.date);
  console.log(req.params.id);
  
  //TODO
  
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
  //adding a new day's track-specific info to the DB
  //date/:date/track/:id
  console.log(req.params.date);
  console.log(req.params.id);
  console.log("body "+ req.body)
  
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
  console.log(req.params.date);
  console.log(req.params.id);
  
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
  console.log(req.params.date);
  console.log(req.params.id);
  
  //TODO
  
  res.status(200).json({
    updated: true
  });
}