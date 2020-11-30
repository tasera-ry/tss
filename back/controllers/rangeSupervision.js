const { validationResult, matchedData } = require('express-validator');
const _ = require('lodash');
const email = require('../mailer.js');
const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const controller = {
  readFilter: async function readFilterSupervisions(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  read: async function read(request, response) {
    if (response.locals.queryResult.length === 0) {
      return response
        .status(404)
        .send({
          error: 'Query didn\'t match range supervision event'
        });
    }

    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  userSupervisions: async function getUserSupervisions(request, response) {
    if (response.locals.queryResult.length === 0) {
      return response
        .status(404)
        .send({
          error: 'User has no supervisions or there is no such user'
        });
    }

    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  create: async function createSupervision(request, response) {
    email('vastaanottaja','update');    
    return response
      .status(201)
      .send(response.locals.queryResult);
     
  },

  // no return here? may be a cause for a bug
  update: async function updateSupervision(request, response) {
    email('vastaanottaja','assigned');    
    response
      .status(204)
      .send();
     
  },

  delete: async function deleteSupervision(request, response) {
    if(response.locals.queryResult === 0) {
      return response
        .status(404)
        .send({
          error: `No range supervision event exists matching id ${response.locals.query.scheduled_range_supervision_id}`
        });
    }

    return response
      .status(204)
      .send();
  }
};

module.exports = controller;
