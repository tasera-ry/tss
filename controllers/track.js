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
    
    var trackListObj = {name:"???",date:date,tracks:{"Kivääri":1,"rata2":2,"rata3":1,"rata4":0}};
  }
  else{
    date = Date.now()
    
    var trackListObj = {name:"???",date:date,tracks:{"Kivääri":2,"Pistooli":1}};
  }
  
  res.status(200).json(trackListObj);
};

