const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));
const email = require('../mailer.js');
const moment = require('moment');
const schedule = require('node-schedule');


//Runs the checker everyday and checks if officer has confirmed 7 days from today
var checker = schedule.scheduleJob(' */1 * * * *', function(){ //'00 00 01 * * 0-6'   eli yhdeltä yöllä joka päivä (ei ekana yönä koska bug).
  //make date object 7 days from this day.
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 7);
  //function that returns the supervisor of 7 days into the future.
  async function getFutureSupervision() {
    return await knex
      .from('user')
      .leftJoin('supervisor', 'user.id', 'supervisor.user_id')
      .leftJoin('scheduled_range_supervision', 'supervisor.user_id', 'scheduled_range_supervision.supervisor_id')
      .leftJoin('range_supervision', 'scheduled_range_supervision.id', 'range_supervision.scheduled_range_supervision_id')
      .leftJoin('range_reservation', 'scheduled_range_supervision.range_reservation_id', 'range_reservation.id')
      .where('range_reservation.date', '=', currentDate)
      .select('scheduled_range_supervision.supervisor_id');
  }
  (async () => {
    receiver = await getFutureSupervision();
    console.log(await getUserEmail(receiver[0].supervisor_id));  
  })();
});



//knex part that should be done in models? returns the email based on the id fetched above:
async function getUserEmail(key) {
  return await knex
    .from('user')
    .select('email')
    .where({ 'user.id': key });
}

async function getSuperuserEmails() {
  return await knex
    .from('user')
    .select('email')
    .where({ role: 'superuser' });
}

// TODO: definitely update the database 1:1 connections so you don't
// have to do this crap
async function getCorrespondingSupervision(id) {
  return await knex
    .from('range_supervision')
    .leftJoin('scheduled_range_supervision', 'range_supervision.scheduled_range_supervision_id', 'scheduled_range_supervision.id')
    .leftJoin('range_reservation', 'scheduled_range_supervision.range_reservation_id', 'range_reservation.id')
    .select('date')
    .where({ scheduled_range_supervision_id: id });
}

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

  feedback: async function sendFeedback(request, response) {
    const feedback = response.locals.query.feedback;
    const useremails = await getSuperuserEmails();
    for (const user of useremails) {
      email('feedback', user.email, { user: response.locals.query.user, feedback });
    }

    return response
      .status(200)
      .send();
  },

  create: async function createSupervision(request, response) {
    try {
      if (!response.req.body.supervisor) return;
      //fetches the supervisor id who is assgined to the range.
      const receiver = await getUserEmail(response.req.body.supervisor);
      //sending fetched email address to mailer.js where it is used to send message that user's supervision has been changed.
      email('update', receiver[0].email, null);
    } catch (error) {
      console.error(error);
    }
    return response
      .status(201)
      .send(response.locals.queryResult);
  },

  update: async function updateSupervision(request, response) {
    //updates.range_supervisor returns "absent" if supervisor has not been assigned. it returns "not confirmed" is supervisor is assigned.
    //if - checks if supervisor is assigned and only sends email if it is set. otherwise it would send email aswell when supervisor is taken off.
    try {
      if (response.locals.updates.range_supervisor === 'not confirmed' && response.locals.updates.supervisor){
        const receiver = await getUserEmail(response.locals.updates.supervisor);
        //sending fetched email address to mailer.js where it is used to send message that user's supervision has been changed.
        email('update', receiver[0].email, null);
      }

      if (response.locals.updates.range_supervisor === 'absent' && response.locals.id.scheduled_range_supervision_id && response.locals.user.name) {
        const useremails = await getSuperuserEmails();
        const supervision = await getCorrespondingSupervision(response.locals.id.scheduled_range_supervision_id);
        const date = moment(supervision.date).format('YYYY-MM-DD');
        for (const user of useremails) {
          email('decline', user.email, { user: response.locals.user.name, date });
        }
      }
    } catch (error) {
      console.error(error);
    }

    return response
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
