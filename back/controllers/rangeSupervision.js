const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));
const _ = require('lodash');
const validate = require('validate.js');
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
 /*if (response.locals.updates.range_supervisor = "absent"){

//muutettu getUserEmail ---> _geet_UserEmail  jotta voidaan pyörittää tässä.
    const vastaanottaja = await geetUserEmail(response.locals.updates.supervisor);
//knex osa, joka pitäisi suorittaa modelseissa:
       async function geetUserEmail(key) {
        return await knex
          .from('user')
          .where({ 'user.id': key })
          .select('user.email');
        }
//knex osa päättyy
    var emailtostring = JSON.stringify(vastaanottaja);
    //tässä kohtaa emailtostring lähettää haetun haetun user.emailin mailer.js tiedostoon jossa se lähtee viestinä Eliaksen spostiin.
    //mailer.js kannattaa mennä muuttamaan omaksi spostiksi jos tahtoo tarkastella sen lähtemistä.
    email('sposti',emailtostring);
}*/
    return response
      .status(201)
      .send(response.locals.queryResult);
  },

  // no return here? may be a cause for a bug
  update: async function updateSupervision(request, response) {

//muutettu getUserEmail ---> _geet_UserEmail  jotta voidaan pyörittää tässä.
    
    AbsentChecker = JSON.stringify(response.locals.updates.range_supervisor);
    const unquoted = String(AbsentChecker.replace(/"([^"]+)":/g, ''));  
    const NotAbsent= '"not confirmed"';
    if (unquoted == NotAbsent){

        const vastaanottaja = await geetUserEmail(response.locals.updates.supervisor);
    //knex osa, joka pitäisi suorittaa modelseissa:
           async function geetUserEmail(key) {
            return await knex
              .from('user')
              .where({ 'user.id': key })
              .select('user.email');
            }
    //knex osa päättyy
        var emailtostring = JSON.stringify(vastaanottaja);
        //tässä kohtaa emailtostring lähettää haetun haetun user.emailin mailer.js tiedostoon jossa se lähtee viestinä Eliaksen spostiin.
        //mailer.js kannattaa mennä muuttamaan omaksi spostiksi jos tahtoo tarkastella sen lähtemistä.
        email('sposti',emailtostring);
    }

    response
      .status(204)
      .send();
  },

//muiden käyttöön ?
// update: async function getUserEmail(key,response) {
//        return response
//  },

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
