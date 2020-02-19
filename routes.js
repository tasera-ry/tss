const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("./config/config");
const { check, validationResult } = require('express-validator');

/*
*  Authorization requires jwt token given by login
*  in the body of the request
*/
authorize = function(req, res, next) {
  const token = req.body.token;
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
  // validate syntax
  check('name').exists()
                    .custom((value) => (value == value.match(/[A-ZÖÄÅa-zöäå0-9 ]+/)))
                    .isLength({ min: 4, max: 30 }),
  check('password').exists()
                    .isAlphanumeric()
                    .isLength({ min: 4, max: 30 })
], async (req, res) => {
  const errors = validationResult(req);
  
  //syntax fail
  if (!errors.isEmpty()) {
    return res.status(422).json({
      login: false,
      err: errors.array() 
    });
  }
  
  let name = req.body.name;
  let password = req.body.password;

  //TODO compare with db
  let dbPassword = "$2a$10$qfTq4eSuU7vTIRBVwCzDyeLlYPwLTiB7jLwXmmsXwUC2hR7YQj3a."
  let dbName = "test"
  let dbRank = "1"
  
  //checks password vs the hash from db
  bcrypt.compare(password, dbPassword, function(err, result) {
    if(result === true){
      
      /* jsonwebtoken for authenticating api calls
      *  contains 3 values: succesful login, rank and when the token was made
      *  sending this token back is required for admin functions
      *
      *  JWTs payload is readable by anyone that gets their hands on it. But the third last part
      *  provides tamper protection so even if the same payload is sent by someone malicious
      *  nothing happens
      */
      /* example token for test test:
      *  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp0cnVlLCJyYW5rIjoiMSIsImlhdCI6MTU4MjA4MzAzMX0.ly57wkYEUC5qWF5Bob-55H_7DL8G7lnJNboP7NTCT7o
      */
      jwt.sign({ auth: true, rank: dbRank }, config.jwt.secret, function(err, token) {
        //succesful login
        if(!err){
          console.log("LOGIN token: "+token);
          res.status(200).json({
            login: true,
            token: token        
          });
        } else {
          console.log(err);
          res.status(401).json({
            login: false,
            err: "Login failed"
          });
        } 
      });

    } else {
      res.status(401).json({
        login: false,
        err: "Login failed"
      });
    }
  });
});

/*
*  Register with post
*  requires body fields: name, password
*/
router.post("/register", function(req,res,next){
  res.locals.rank = [1,2];
  next();
}, authorize, [
  // validate syntax
  check('name').exists()
                    .custom((value) => (value == value.match(/[A-ZÖÄÅa-zöäå0-9 ]+/)))
                    .isLength({ min: 4, max: 30 }),
  check('password').exists()
                    .isAlphanumeric()
                    .isLength({ min: 4, max: 30 })
], async (req, res) => {
  const errors = validationResult(req);
  
  //syntax fail
  if (!errors.isEmpty()) {
    return res.status(422).json({
      login: false,
      err: errors.array() 
    });
  }
  
  let name = req.body.name;
  let password = req.body.password;
  
  //generates salted hash of the password
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
          //TODO Store hash in your password DB.
          console.log("REGISTER hash: "+hash);
          
          //TODO act according to db response
          if(!err){
            res.status(200).json({
              register: true
            });
          } else {
            console.log(err);
            
            res.status(400).json({
              register: false,
              err: "Registration failed"
            });
          }
      });
  });
});

module.exports = router;