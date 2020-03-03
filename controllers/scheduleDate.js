/*
*  Get date info
*/
exports.date = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log(date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    
    //TODO get tracks (scheduleTrack)
    //TODO range officer
    
    var trackListObj = {name:"???",date:date,rangeOfficer:true,tracks:{"Kivääri":1,"rata2":2,"rata3":1,"rata4":0,"rata5":0,"rata6":0,"rata7":0}};
  }
  else{
    date = Date.now()
    
    var trackListObj = {name:"???",date:date,rangeOfficer:false,tracks:{"Kivääri":2,"Pistooli":1}};
  }
  
  res.status(200).json(trackListObj);
};

/*
* Add date with body params
*/
exports.addDate = async (req, res) => {
  console.log(req.params.date)
  console.log("body "+ req.body)
  
  //TODO
  
  res.status(200).json({
    added: true
  });
}

/*
* Delete a date
*/
exports.deleteDate = async (req, res) => {
  console.log(req.params.date)
  
  //TODO
  
  res.status(200).json({
    deleted: true
  });
}

/*
* Update a date
*/
exports.updateDate = async (req, res) => {
  console.log(req.params.date)
  
  //TODO
  
  res.status(200).json({
    updated: true
  });
}