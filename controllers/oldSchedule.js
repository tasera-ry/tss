const config = require("../config/config");
const moment = require("moment-timezone");
const fetch = require("node-fetch");
const _ = require('lodash');

/*
*  Get complete scheduling for a date
*  Returns raw json object containing:
    {
      date:'YYYY-MM-DD',
      rangeId: 1,
      reservationId: 100,           null if doesn't exist
      scheduleId: 100,              null if doesn't exist
      open: "02:00:00",
      close: "03:00:00",
      available: true,              we only care about condition: available === false
      rangeSupervisorId: 1,
      rangeSupervision:'present',
        //present=green,            from range_supervision.range_supervisor
        //absent=white,             from range_supervision.range_supervisor
        //confirmed=lightGreen,     from range_supervision.range_supervisor
        //en route=yellow,          from range_supervision.range_supervisor
        //closed=red                from reservation.available === false
        //not confirmed=blue        from range_supervision.range_supervisor
      tracks: [
        {
          id: 1,
          name:'Shooting Track 1',
          description: '',
          notice: 'text',
          trackSupervision:'closed'
            //present=green,            from track_supervision.track_supervisor
            //absent=white,             from track_supervision.track_supervisor
            //closed=red                from track_supervision.track_supervisor
          scheduled: true               for scheduling.js to understand which exist already
        }
      ]
    }
*/
exports.getScheduleDate = async (req, res) => {
  async function getTracks() {
    try{
      let response = await fetch(config.server.host+"/api/track", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    }catch(err){
      console.error(err);
      return false;
    }
  }
  
  async function getReservation(date) {
    try{
      let response = await fetch(config.server.host+"/api/reservation?date="+moment(date).format('YYYY-MM-DD'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    }catch(err){
      console.error(err);
      return false;
    }
  }
  
  async function getSchedule(reservationId) {
    try{
      let response = await fetch(config.server.host+"/api/schedule?range_reservation_id="+reservationId, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    }catch(err){
      console.error(err);
      return false;
    }
  }
  
  async function getTracksupervision(scheduleId) {
    try{
      let response = await fetch(config.server.host+"/api/track-supervision?scheduled_range_supervision_id="+scheduleId, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    }catch(err){
      console.error(err);
      return false;
    }
  }
  
  async function getRangesupervision(scheduleId) {
    try{
      let response = await fetch(config.server.host+"/api/range-supervision?scheduled_range_supervision_id="+scheduleId, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    }catch(err){
      console.error(err);
      return false;
    }
  }
  
  //actually constructing the return
  if(moment(req.params.date, 'YYYY-MM-DD', true).isValid()){
    
    let date = req.params.date;
    let tracks = await getTracks();
    let rangeId = config.development.range_id;
    let reservationId = null;
    let available = null;
    let scheduleId = null;
    let rangeSupervisorId = null;
    let open = null;
    let close = null;
    let rangeSupervisionState = 'absent';
         
    const reservation = await getReservation(date);
    if(reservation !== false && reservation.length > 0) {
      reservationId = reservation[0].id;
      available = reservation[0].available;
    } else reservationId = null;

    const schedule = await getSchedule(reservationId);
    if(schedule !== false && schedule.length > 0) {
      scheduleId = schedule[0].id;
      rangeSupervisorId = schedule[0].supervisor_id;
      open = schedule[0].open;
      close = schedule[0].close;
    } else scheduleId = null;

    //track defaults
    tracks = tracks.map(item => {
      item = {
        ...item,
        description: '',
        notice: '',
        trackSupervision: 'absent',
        scheduled: false
      }
      return _.pick(item, ['id', 'name', 'description', 'notice', 'trackSupervision', 'scheduled']);
    });

    const trackSupervision = await getTracksupervision(scheduleId);
    if(trackSupervision !== false && trackSupervision.length > 0) {
      tracks = tracks.map(item => {
        item = {
          ...item,
          ...trackSupervision.find((findItem) => findItem.track_id === item.id),
          scheduled: true
        }
        item.trackSupervision = item.track_supervisor;
        return _.pick(item, ['id', 'name', 'description', 'notice', 'trackSupervision', 'scheduled']);
      });
    }

    const rangeSupervision = await getRangesupervision(scheduleId);
    if(rangeSupervision !== false && rangeSupervision.length > 0) {
      rangeSupervisionState = rangeSupervision[0].range_supervisor;
    }

    let result = {
      date:date,
      rangeId:rangeId,
      reservationId:reservationId,
      scheduleId:scheduleId,
      open:open,
      close:close,
      available:available,
      rangeSupervisorId:rangeSupervisorId,
      rangeSupervision:(available === false ? 'closed' : rangeSupervisionState),
      tracks:tracks
    }
    
    if(tracks && reservation && schedule){
      res.status(200).json(result);
    }
    else{
      res.status(400).json();
    }
  }
  else{
    res.status(400).json();
  }
}