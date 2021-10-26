const jwt = require('jsonwebtoken');
const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config'));
const _ = require('lodash');

const controller = {
  read: async function readMembers(request, response) {
    //if no results end in 404 but for filters return empty list instead
    if(response.locals.queryResult.length === 0 && !response.locals.filtered) {
      return response
        .status(404)
        .send({
          error: 'Unknown club'
        });
    }

    return response
      .status(200)
      .send(response.locals.queryResult);
  }
};

module.exports = controller;