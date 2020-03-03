/*
*  Get tracks
*/
exports.tracks = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log(date);
  let tracks=[];
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    
    //TODO get tracks from db with date
    //select track.name, track.availability from tracks where date=?
    
    var trackListObj = {name:"???",date:date,tracks:{"Kivääri":1,"rata2":2,"rata3":1,"rata4":0,"rata5":0,"rata6":0,"rata7":0}};
  }
  else{
    date = Date.now()
    
    var trackListObj = {name:"???",date:date,tracks:{"Kivääri":2,"Pistooli":1}};
  }
  
  res.status(200).json(trackListObj);
};


/*
* Get a track with identifier
*/
exports.track = async (req, res) => {
  //tracks/:date/:id
  console.log("date "+req.params.date)
  console.log("id "+req.params.id)
  
  //TODO get track from db with date and id
  
  var trackObj = {name:"Kivääri",status:1,info:"???"};
  
  res.status(200).json({
    track: trackObj
  });
}

/*
* Add a track with body params
*/
exports.addTrack = async (req, res) => {
  //tracks
  console.log("body "+ req.body)
  
  //TODO add track to db
  
  res.status(200).json({
    added: true
  });
}

/*
* Delete a track with id
*/
exports.deleteTrack = async (req, res) => {
  //tracks/:id
  console.log("id "+req.params.id)
  
  //TODO delete track from db
  
  res.status(200).json({
    deleted: true
  });
}

/*
* Update a track with id
*/
exports.updateTrack = async (req, res) => {
  //tracks/:id
  console.log("id "+req.params.id)
  
  //TODO update track
  
  res.status(200).json({
    updated: true
  });
}