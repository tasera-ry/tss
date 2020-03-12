const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { validationResult } = require('express-validator');

const knex = require('../knex/knex')

/*
*  Login
*  requires body fields: name, password
*/
exports.login = async (req, res) => {
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

  (knex
   .from('member')
   .select('name', 'password')
   .where({ name: name })

   .then((rows) => {
     const dbUser = rows.pop()

     // TODO compare with db
     const dbRank = '1'

     //checks password vs the hash from db
     bcrypt.compare(password, dbUser.password, function(err, result) {
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
             res.status(200).cookie("access",token).json({
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
   }).catch((err) => {
     console.log(err)
     res.status(401).json({
       login: false,
       err: "Login failed"
     })
   })
  )
}

/*
*  Register
*  requires body fields: name, password
*/
exports.register = async (req, res) => {
  const errors = validationResult(req);
  
  //syntax fail
  if (!errors.isEmpty()) {
    return res.status(422).json({
      register: false,
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
};

