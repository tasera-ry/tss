
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("./config/config");
const { check } = require("express-validator");

//require controller
const user = require("./controllers/user");
const track = require("./controllers/track");
const scheduleTrack = require("./controllers/scheduleTrack");
const scheduleDate = require("./controllers/scheduleDate");

/*
*  Authorization requires jwt token given by login
*  in the body of the request
*/

authorize = function(req, res, next) {
  const token = req.body.token || req.cookies.access;
  let auth = false;

  if (token && res.locals.rank) {
    console.log("AUTHORIZATION token: "+token);

    //auth part, decode token
    jwt.verify(token, config.jwt.secret, function(err, decoded) {
      //decoding error
      if(err) {
        console.log(err);
      }
      //logged in
      else if(decoded.auth !== true){
        console.log("AUTHORIZATION login false")
      }
      //rank matches route requirement
      else if(!res.locals.rank.includes(parseInt(decoded.rank))){
        console.log("AUTHORIZATION Given rank: "+decoded.rank+" Required rank: "+res.locals.rank);
      }
      //authorization success
      else {
        console.log("AUTHORIZATION success");
        auth = true;
        next();
      }
    });
  }

  if(!auth){
    console.log("AUTHORIZATION failed")
    return res.status(401).json({
      auth: false,
      err: "Unauthorized"
    });
  }
}

/*
 *  Login with post
 *  requires body fields: name, password
 */
router.post("/login", [
  check('name').exists()
    .custom((value) => (value == value.match(/[A-ZÖÄÅa-zöäå0-9 ]+/)))
    .isLength({ min: 4, max: 30 }),
  check('password').exists()
                    .isAlphanumeric()
                    .isLength({ min: 4, max: 30 })
], user.login);

/*
*  Register with post
*  requires body fields: name, password
*
*  1. Sets required rank
*  2. Authorization with token and rank
*  3. Validates params
*  4. Uses register from user controller
*/
router.post("/register", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize, [

  check('name').exists()
    .custom((value) => (value == value.match(/[A-ZÖÄÅa-zöäå0-9 ]+/)))
    .isLength({ min: 4, max: 30 }),
  check('password').exists()
                    .isAlphanumeric()
                    .isLength({ min: 4, max: 30 })
], user.register);

/*
*  Date
*/
//also allows /date with the ? modifier
router.get("/date/:date?", scheduleDate.date);
router.get("/week/:date?", scheduleDate.week);

router.post("/date", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize, scheduleDate.addDate);

router.delete("/date/:date", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,scheduleDate.deleteDate);

router.put("/date/:date", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,scheduleDate.updateDate);

/*
*  Track
*/
//TODO verify how to identify
//get tracks
router.get("/track", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,track.track);
//add a track
router.post("/track", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,track.addTrack);
//delete one
router.delete("/track/:id", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,track.deleteTrack);
//update one
router.put("/track/:id", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,track.updateTrack);

/*
*  Schedule
*/
router.get("/date/:date/track/:id?", scheduleTrack.trackInfoForDay);

router.post("/date/:date/track/:id", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize, scheduleTrack.addTrackInfoForDay);
router.delete("/date/:date/track/:id", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,scheduleTrack.deleteTrackInfoForDay);
router.put("/date/:date/track/:id", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize,scheduleTrack.updateTrackInfoForDay);

module.exports = router;
