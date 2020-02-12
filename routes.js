const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require('express-validator');

/*
*  Authorization requires jwt token given by login
*  in the body of the request
*/
//TODO authorization for different ranks
authorize = function(req, res, next) {
  const token = req.body.token;
  console.log("AUTHORIZATION token: "+token);
  if (token) {
    //auth part
    jwt.verify(token, "secret", function(err, decoded) {
      if(err || decoded.auth !== true){
        console.log(err);
        res.status(401).json({
          auth: false,
          err: "Unauthorized"
        });
      }
      else next();
    });
  } else {
    res.status(401).json({
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
  
  //checks password vs the hash from db
  bcrypt.compare(password, dbPassword, function(err, result) {
    if(result === true){
      
      /* jsonwebtoken for authenticating api calls
      *  contains 3 values: succesful login, who logged in and when the token was made
      *  sending this token back is required for admin functions
      */
      /* example token for test test:
      *  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp0cnVlLCJuYW1lIjoidGVzdCIsImlhdCI6MTU4MTMwNDQ3OH0.8Y5jez2_XBSc7ob0KCjz0FGeuJ5pT3nr7jC1rPUZONE
      */
      //TODO better secret
      jwt.sign({ auth: true, name: name }, "secret", function(err, token) {
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
router.post("/register", authorize,[
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