
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
<<<<<<< HEAD
const { check, validationResult } = require('express-validator');
=======
const config = require("./config/config");
const { check } = require('express-validator');

//require controller
const user = require('./controllers/user');
>>>>>>> develop

/*
*  Authorization requires jwt token given by login
*  in the body of the request
*/

authorize = function(req, res, next) {
<<<<<<< HEAD
  const token = req.body.token;
  console.log("AUTHORIZATION token: "+token);
  if (token) {
    //auth part
    jwt.verify(token, "secret", function(err, decoded) {
      if(err || decoded.auth !== true){
=======
  const token = req.body.token || req.cookies.access;
  let auth = false;

  if (token && res.locals.rank) {
    console.log("AUTHORIZATION token: "+token);

    //auth part, decode token
    jwt.verify(token, config.jwt.secret, function(err, decoded) {
      //decoding error
      if(err) {
>>>>>>> develop
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
<<<<<<< HEAD
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
=======
], user.login);
>>>>>>> develop

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


module.exports = router;
