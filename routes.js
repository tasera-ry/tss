const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const { check, body, query, param, validationResult, matchedData } = require("express-validator");

const path = require('path')
const root = path.join(__dirname, '.')

const config = require(path.join(root, 'config', 'config'))
// const express_jwt = require('express-jwt')({ secret: config.jwt.secret })

//console spam comes from validator initialization?
const validators = require(path.join(root, 'validators'))
const middlewares = require(path.join(root, 'middlewares'))
const controllers = require(path.join(root, 'controllers'))

const scheduleTrack = require(path.join(root, 'controllers', 'scheduleTrack'))
const scheduleDate = require(path.join(root, 'controllers', 'scheduleDate'))

router.route('/sign')
  .post(
    middlewares.user.sign
    , controllers.user.sign)

router.route('/user')
  .all(middlewares.jwt.read)


router.route('/user')
  .all(
    middlewares.jwt.read
    , middlewares.user.hasProperty('role', 'superuser'))
  .get(
    middlewares.user.readFilter
    , controllers.user.readFilter)
  .post(
    middlewares.user.create
    , controllers.user.create)

router.route('/user/:id')
  .all(
    middlewares.jwt.read
    , middlewares.user.hasProperty('role', 'superuser'))
  .get(
    middlewares.user.read
    , controllers.user.read)
  .put(
    middlewares.user.update
    , controllers.user.update)
  .delete(
    middlewares.user.delete
    , controllers.user.delete)


/* TODO move to middlewares */
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
//TODO suggest better authz
//router.route('/track')
//  .all(middlewares.jwt.read)

router.route('/track')
  .get(
    validators.track.readAll
    , middlewares.track.read
    , controllers.track.read)
  .post(
    validators.track.create
    , middlewares.track.create
    , controllers.track.create)

router.route('/track/:id')
  .get(
    validators.track.read
    , middlewares.track.read
    , controllers.track.read)
  .put(
    validators.track.update
    , middlewares.track.update
    , controllers.track.update)
  .delete(
    validators.track.delete
    , middlewares.track.delete
    , controllers.track.delete)

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
