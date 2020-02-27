/*
*  Get tracks
*/
exports.tracks = async (req, res) => {
  let date = req.params.date;
  let tracks=[];
  if(date){
    //TODO get tracks from db with date
    //select track.name, track.availability from tracks where date=?
    
    //year-month-day
    console.log(date);
    var d = Date.parse(date);
    
    var trackListObj = {name:"???",date:d,tracks:{"Kivääri":1,"rata2":2,"rata3":1,"rata4":0}};
  }
  else{
    var d = Date.now()
    
    var trackListObj = {name:"???",date:d,tracks:{"Kivääri":2,"Pistooli":1}};
  }
  
  res.status(200).json(trackListObj);
};

