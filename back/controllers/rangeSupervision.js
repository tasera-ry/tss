const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));
const { email } = require('../mailer.js');
const moment = require('moment');
const schedule = require('node-schedule');
const services = require(path.join(root, 'services'));


async function scheduleEmailReminder() {
  try {
    const emailSettings = await services.emailSettings.read();
    if( !emailSettings || !emailSettings.sendPendingTime ) {
      console.error("scheduleEmailReminder cannot read emailSettings sendPendingTime!", emailSettings)
      return
    }
    const sendTime = new Date(emailSettings.sendPendingTime)
    const hour = sendTime.getHours().toString().padStart(2, '0');
    const minute = sendTime.getMinutes().toString().padStart(2, '0');
    console.log("scheduleEmailReminder: hour", hour)
    console.log("scheduleEmailReminder: minute", minute)
    //Runs the checker everyday and checks if officer has confirmed 7 days from today
    //Stars of the scheduler explained below:
    //'seconds', 'minutes', 'hour', 'day of month', 'month', 'day of week'
    //For test purposes, you can replace the function declaration with this. It runs the code every 4 seconds.
    // schedule.scheduleJob('*/4 * * * * *', async function(){
    schedule.scheduleJob(`00 ${minute} ${hour} * * 0-6`, async function () {
      //make date object 7 days from this day.
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      //function that returns the association of 7 days into the future.
      async function getFutureSupervision() {
        return await knex
          .from('user')
          .leftJoin('association', 'user.id', 'association.user_id')
          .leftJoin('scheduled_range_supervision', 'association.user_id', 'scheduled_range_supervision.association_id')
          .leftJoin('range_supervision', 'scheduled_range_supervision.id', 'range_supervision.scheduled_range_supervision_id')
          .leftJoin('range_reservation', 'scheduled_range_supervision.range_reservation_id', 'range_reservation.id')
          .where('range_reservation.date', '=', currentDate)
          .select('scheduled_range_supervision.association_id', 'range_supervisor');
      }
      try {
        const receiver = await getFutureSupervision();
        //first we check if the supervisor has confirmed or not.
        //if status = not cnofirmed, fetches email with supervisor id and sends it to mailer.js 
        if (receiver[0] != undefined && receiver[0].range_supervisor === 'not confirmed') {
          email('reminder', receiver[0].association_id, null);
        }
      } catch (error) {
        console.error(error);
      }
    });
  } catch (err) {
    console.error(err)
  }
}
scheduleEmailReminder();

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

  associationSupervisions: async function getAssociationSupervisions(request, response) {
    if (!response.locals.queryResult) {
      return response
        .status(404)
        .send({
          error: 'Association has no supervisions'
        });
    }

    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  feedback: async function sendFeedback(request, response) {
    const feedback = response.locals.query.feedback;
    const superusers = response.locals.superusers;

    try {
      for (const superuser of superusers) {
        email('feedback', superuser, { user: response.locals.query.user, feedback });
      }
    } catch (error) {
      console.log(error);
    }

    return response
      .status(200)
      .send();
  },

  create: async function createSupervision(request, response) {
    try {
      if (!response.req.body.association) return;
      const scheduleId = response.locals.id;
      email('assigned', response.req.body.association, { scheduleId: scheduleId });
    } catch (error) {
      console.error(error);
    }
    return response
      .status(201)
      .send(response.locals.queryResult);
  },

  update: async function updateSupervision(request, response) {
    //updates.range_supervisor returns "absent" if association has not been assigned. it returns "not confirmed" is association is assigned.
    //if - checks if association is assigned and only sends email if it is set. otherwise it would send email aswell when association is taken off.
    try {
      const scheduleId = response.locals.id.scheduled_range_supervision_id;
      if (response.locals.updates.range_supervisor === 'not confirmed' && response.locals.updates.association){
        email('update', response.locals.updates.association, { scheduleId: scheduleId });
      }

      if (response.locals.updates.range_supervisor === 'absent' && response.locals.user.name) {
        const superusers = response.locals.superusers;
        const supervision = await getCorrespondingSupervision(scheduleId);
        const date = moment(supervision.date).format('YYYY-MM-DD');
        for (const superuser of superusers) {
          email('decline', superuser, { user: response.locals.user.name, date });
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
