const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));
const email = require('../mailer.js');

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
    
    try{
      //fetches the supervisor id who is assgined to the range.
      const reciever = await getUserEmail(response.req.body.supervisor);
      //knex part that should be done in models? returns the email based on the id fetched above:
      async function getUserEmail(key) {
        return await knex
          .from('user')
          .where({ 'user.id': key })
          .select('user.email');
      }
      //knex part ends.
      var emailString = JSON.stringify(reciever);
      //sending fetched email address to mailer.js where it is used to send message that user has been assigned a supervision
      email('assigned', emailString);
    } catch (error) {
      console.error(error);
    }
    return response
      .status(201)
      .send(response.locals.queryResult);
  },

  // no return here? may be a cause for a bug
  update: async function updateSupervision(request, response) {

    //updates.range_supervisor returns "absent" if supervisor has not been assigned. it returns "not confirmed" is supervisor is assigned.
    //if - checks if supervisor is assigned and only sends email if it is set. otherwise it would send email aswell when supervisor is taken off.
    try{ 
      const absentChecker = JSON.stringify(response.locals.updates.range_supervisor);
      const unquoted = String(absentChecker.replace(/"([^"]+)":/g, ''));  
      const notAbsent= '"not confirmed"';
      if (unquoted == notAbsent){
        const reciever = await getUserEmail(response.locals.updates.supervisor);
        //knex part that should be done in models?:
        async function getUserEmail(key) {
          return await knex
            .from('user')
            .where({ 'user.id': key })
            .select('user.email');
        }
        //knex part ends
        var emailString = JSON.stringify(reciever);
        //sending fetched email address to mailer.js where it is used to send message that user's supervision has been changed. 
        email('update', emailString);
      }
    } catch (error) {
      console.error(error);
    }   

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
