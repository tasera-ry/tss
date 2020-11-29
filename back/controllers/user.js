const jwt = require('jsonwebtoken');
const _ = require('lodash');

const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config'));


const controller = {
  sign: async function signUser(request, response) {
    const jwtSign = jwt.sign({ id: response.locals.id }, config.jwt.secret);
    return response
      .status(200)
      .cookie('token', jwtSign,
      {
        httpOnly: true,
        secure: true,
        sameSite: true
      })
      .send();
  }

  , readFilter: async function readFilterUsers(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  }

  , read: async function read(request, response) {
    if(response.locals.queryResult.length === 0) {
      return response
        .status(404)
        .send({
          error: 'Query didn\'t match a user'
        });
    }
    return response
      .status(200)
      .send(response.locals.queryResult);
  }

  , create: async function createUser(request, response) {
    return response
      .status(201)
      .send(response.locals.queryResult);
  }

  , read: async function readUser(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  }

  , update: async function updateUser(request, response) {
    return response
      .status(204)
      .send();
  }

  , delete: async function deleteUser(request, response) {
    if(response.locals.queryResult === 0) {
      return response
        .status(404)
        .send({
          error: `No user exists matching id ${response.locals.query.id}`
        });
    }
    return response
      .status(204)
      .send();
  }
};

module.exports = controller;
