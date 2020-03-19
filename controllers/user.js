const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult, matchedData } = require('express-validator');

const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const secret = require(path.join(root, 'config', 'config')).jwt.secret

const controller = {
  sign: async function signUser(request, response) {
    const validationErrors = validationResult(request)

    if(validationErrors.isEmpty() === false) {
      return response.status(400).send(validationErrors)
    }

    const credentials = matchedData(request, { locations: ['body'] })

    const id = await services.user.authenticate(credentials)
    if(id === undefined) {
      return response.set('WWW-Authenticate', 'Basic').status(401).send()
    }
    
    return response.send(
      jwt.sign({
        id: id
      }, secret))
  }

  , readAll: async function readAllUsers(request, response) {
    const validationErrors = validationResult(request)

    if(validationErrors.isEmpty() === false) {
      return response.status(400).send(validationErrors)
    }

    const query = matchedData(request, { locations: ['query'] })

    return response.send(await services.user.read(query))
  }

  , create: async function createUser(request, response) {
    const validationErrors = validationResult(request)

    if(validationErrors.isEmpty() === false) {
      return response.status(400).send(validationErrors)
    }

    const userDetails = matchedData(request, { locations: ['body'] })

    return response.send(await services.user.create(userDetails))
  }

  , read: async function readUser(request, response) {
    const validationErrors = validationResult(request)

    if(validationErrors.isEmpty() === false) {
      return response.status(400).send(validationErrors)
    }

    const query = matchedData(request)

    return response.send(await services.user.read(query))
  }
}

/*
*  Register
*  requires body fields: name, password
*/
controller.register = async (req, res) => {
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

module.exports = controller
