const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));
const reservationModel = models.reservation;
const scheduleModel = models.schedule;
const rangeSupervisionModel = models.rangeSupervision;
const rangeModel = models.range;

const DEFAULT_OPENING_HOURS = { 
  weekend : { open: '10:00', close : '16:00' },
  weekdays : { open: '17:00', close : '20:00'}
};
const DEFAULT_RANGE_SUPERVISOR_STATE = 'not confirmed';
const DEFAULT_RANGE_AVAILABE = true;

/* Set the supervisors to database according to the raffle results */
async function setSupervisors(raffleResults) {
  const setSingleSupervisor = async (rangeId, supervisorId, date) => {
    const rangeReservationId = await updateOrCreateRangeReservation(date, rangeId);
    const scheduledRangeSupervisionId = await updateOrCreateScheduledRangeSupervision(
      rangeReservationId, date, supervisorId
    );
    await updateOrCreateRangeSupervision(scheduledRangeSupervisionId);  
  };
  
  const range_id = await getRangeId(); 
  await Promise.all(raffleResults.map(async result => {
    const { supervisor_id, date  } = result;
    await setSingleSupervisor(range_id, supervisor_id, date);
  })
  );
}

const service = {
  set: setSupervisors
};

module.exports = service;

// Helper functions

const getRangeId = async () => {
  // There is only one shooting range
  return (await rangeModel.readAllRanges())[0].id;
};

const getRangeReservationId = async (date, rangeId) => {
  const fields = [ 'id' ];
  const searchKey = { date, range_id: rangeId };

  const rangeReservation = await reservationModel.read(searchKey, fields);
  if(rangeReservation.length === 0) return undefined;
  
  const { id } = rangeReservation[0];
  return id;
};

const updateOrCreateRangeReservation = async (date, rangeId) => {
  const rangeReservationId = await getRangeReservationId(date, rangeId);
  if (!rangeReservationId) {
    const newRangeReservation = {
      date, available: DEFAULT_RANGE_AVAILABE,
      range_id: rangeId
    };
    const { id } = (await reservationModel.create(newRangeReservation))[0];
    return id;
  }

  await reservationModel.update({id: rangeReservationId}, {available: 'true'});
  return rangeReservationId;
};

const getScheduledRangeSupervisionId = async (rangeReservationId) => {
  const fields = [ 'id' ];
  const searchKey = { range_reservation_id: rangeReservationId };
  const scheduledRangeSupervision = await models.schedule.read(searchKey, fields);
  if(scheduledRangeSupervision.length === 0) return undefined;
  const { id } = scheduledRangeSupervision[0];

  return id;
};

const getOpeningHours = (weekday) => {
  const SATURDAY = 6;
  const SUNDAY = 0;
  if (weekday === SATURDAY || weekday === SUNDAY) {
    return DEFAULT_OPENING_HOURS['weekend'];
  }
  else {
    return DEFAULT_OPENING_HOURS['weekdays'];
  }
};

const updateOrCreateScheduledRangeSupervision = async (
  rangeReservationId,
  date,
  supervisorId) =>
{
  const scheduledRangeSupervisionId =
    await getScheduledRangeSupervisionId(rangeReservationId);
  const weekday = new Date(date).getDay();
  const openingHours = getOpeningHours(weekday);

  const scheduledRangeSupervision = {
    ...openingHours,
    supervisor_id: supervisorId,
    range_reservation_id: rangeReservationId
  };

  if (!scheduledRangeSupervisionId) {
    const { id } = (await scheduleModel.create(scheduledRangeSupervision))[0];
    return id;
  }
  
  await scheduleModel.update(
    {id: scheduledRangeSupervisionId},
    scheduledRangeSupervision
  );

  return scheduledRangeSupervisionId;
};
   
const updateOrCreateRangeSupervision = async (scheduledRangeSupervisionId) => {
  const rangeSupervision = {
    scheduled_range_supervision_id: scheduledRangeSupervisionId,
    range_supervisor: DEFAULT_RANGE_SUPERVISOR_STATE 
  };
  
  const rangeSupervisionDoesntExist =
    (await rangeSupervisionModel
      .read({scheduled_range_supervision_id: scheduledRangeSupervisionId}, []))
      .length === 0;
  if (rangeSupervisionDoesntExist) {
    await rangeSupervisionModel.create(rangeSupervision);
    return;
  }
  
  await rangeSupervisionModel.update(
    {scheduled_range_supervision_id: scheduledRangeSupervisionId},
    rangeSupervision
  );
  return;
};
