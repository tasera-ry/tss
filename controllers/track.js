/*
*  Get tracks
*/
exports.track = async (req, res) => {
  console.log("TRACK ");
  
  //TODO
  
  var tracks = ["Kivääri","rata2","rata3","rata4","rata5","rata6","rata7"];
  
  res.status(200).json({
    tracks: tracks
  });
};

/*
* Add a track with body params
*/
exports.addTrack = async (req, res) => {
  console.log("TRACK "+"body "+ req.body)
  
  //TODO
  
  res.status(200).json({
    added: true
  });
}

/*
* Delete a track with id
*/
exports.deleteTrack = async (req, res) => {
  console.log("TRACK "+"id "+req.params.id)
  
  //TODO
  
  res.status(200).json({
    deleted: true
  });
}

/*
* Update a track with id
*/
exports.updateTrack = async (req, res) => {
  console.log("TRACK "+"id "+req.params.id)
  
  //TODO
  
  res.status(200).json({
    updated: true
  });
}