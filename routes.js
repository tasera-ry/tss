const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');

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
  console.log(name +" "+ password);

  //TODO compare with db
  
  if(password === 'test' && name === 'test'){
    res.status(200).json({
      login: true
      
      //TODO send back something to auth with. jwt, cookie, ?
      
    });
  } else {
    res.status(401).json({
      login: false,
      err: "Login failed"
    });
  }
});

module.exports = router;