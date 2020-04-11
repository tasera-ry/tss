const knex = require('../knex/knex')
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
      rangeSupervision:'present',
        //present=green,            from range_supervision.range_supervisor
        //absent=white,             from range_supervision.range_supervisor
        //confirmed=lightGreen,     from range_supervision.range_supervisor
        //en route=yellow,          from range_supervision.range_supervisor
        //closed=red                from reservation.available === false
      tracks: [
        {
          id: 1,
          name:'Shooting Track 1',
          description: '',              currently not used
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
      rangeSupervision:rangeSupervisionState,
      tracks:tracks
    }
    
    if(tracks && reservation && schedule){
      res.status(200).json(result);
    }
  }
  res.status(400).json();
}

/*
*  Get date info
*/
exports.date = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log("SCHEDULE_DATE "+date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    
    //track defaults when range closed
    async function tracks() {
      let rows = await knex
        .from('range')
        .select('track.name')
        .join('track','track.range_id','=','range.id')
        .where('range.id', config.development.range_id)
        .orderBy('track.name','asc')
      let trackList = []
      while(rows.length !== 0) {
        const trackInfo = rows.pop()
        //by default closed and correct state set afterwards
        let trackObj = {name:trackInfo.name,status:"closed"};
        trackList.push(trackObj)
      }
      return trackList;
    }
    const defaultTracks = await tracks();
    
    //get specific date
    //localhost:3000/api/date/2020-02-20
    (
      knex
        .from('range')
        .select(
          'range.name as rangeName',
          'range_reservation.available',
          'supervisor_id as rangeOfficer',
          'track_supervisor',
          'track_supervision.notice',
          'track.name',
          'track.description'
        )
        .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
        //left join since range if not available would return nothing otherwise
        .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
        .leftJoin('track_supervision', 'scheduled_range_supervision.id', '=', 'scheduled_range_supervision_id')
        .leftJoin('track', 'track_supervision.track_id', '=', 'track.id')
        .where('date', req.params.date)
        //TODO remove hard coded range below
        .where('range.id', config.development.range_id)

        .then((rows) => {
          if(rows.length === 0){
            trackListObj = {date:date,rangeOfficer:false,tracks:defaultTracks};
            res.status(200).json(trackListObj);
          }
          else {
            //console.log(rows);
            console.log("SCHEDULE_DATE rows length "+rows.length)
            
            let trackList = [];
            let roState;
            
            while(rows.length !== 0) {
              const trackInfo = rows.pop()
              
              roState = (trackInfo.rangeOfficer !== null) ? true : false;
              let toState = trackInfo.track_supervisor;
              
              var trackObj = {name:trackInfo.name,status:toState};
              trackList.push(trackObj)
            }
            
            //on each defaulttracks array item runs map function to add correct status from the new array
            //a.k.a. gets defaults adds possible status on top
            const combinedTracks = defaultTracks.map((item, i, arr) => ({
              ...item,
              ...trackList.find((findItem) => findItem.name === item.name)
            }));

            console.log("SCHEDULE_DATE tracks",combinedTracks)
            
            combinedTracks.reverse();
            trackListObj = {date:date,rangeOfficer:roState,tracks:combinedTracks};
            res.status(200).json(trackListObj);
          }
        })
    )
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};

/*
*  Get week info
*/
exports.week = async (req, res) => {
  //year-month-day
  let date = new Date(req.params.date);
  console.log("SCHEDULE_WEEK "+date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    let weekNum = moment(req.params.date, "YYYYMMDD").isoWeek();
    let begin = moment(req.params.date, "YYYYMMDD").startOf('isoWeek').format('YYYY-MM-DD');
    let end = moment(req.params.date, "YYYYMMDD").endOf('isoWeek').format('YYYY-MM-DD');
    console.log("WEEK "+weekNum+ " BEGIN "+begin+ " END "+end);
    
    //week defaults
    async function week() {
      let day = moment(req.params.date, "YYYYMMDD").startOf('isoWeek');
      let dayList = [];
      for (i = 0; i < 7; i++) {
        let dayObj = {date:day.format('YYYY-MM-DD'),status:"range officer unavailable"};
        dayList.push(dayObj);
        day.add(1,"day");
      }
      return dayList;
    }
    const defaultWeek = await week();
    
    //get specific week
    //localhost:3000/api/week/2020-02-20
    (
      knex
        .from('range')
        .select('range.name as rangeName','range_reservation.available','supervisor_id as rangeOfficer','range_reservation.date','range_supervisor')
        .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
        .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
        .leftJoin('range_supervision', 'scheduled_range_supervision.id', '=', 'scheduled_range_supervision_id')
        .whereBetween('date', [begin, end])
        //TODO remove hard coded range below
        .where('range.id', config.development.range_id)
        .orderBy('date', 'asc')
        
        .then((rows) => {
          if(rows.length === 0){
            dayListObj = {weekNum:weekNum,weekBegin:begin,weekEnd:end,days:defaultWeek};
            res.status(200).json(dayListObj);
          }
          else {
            let dayList = [];
            let roState;
            
            while(rows.length !== 0) {
              const dayInfo = rows.pop();
              console.log("DAYINFO:",dayInfo)
              roState = (dayInfo.rangeOfficer !== null) ? true : false;
              
              let status;
              if(dayInfo.range_supervisor === 'present'){
                status="present"; //green
              }
              else if(dayInfo.range_supervisor === 'confirmed'){
                status="confirmed"; //lightgreen
              }
              else if(dayInfo.range_supervisor === 'en route'){
                status="en route"; //yellow
              }
              else if(dayInfo.available === false){
                status="closed"; //red
              }
              else if(dayInfo.range_supervisor === 'absent'){
                status="absent"; //white
              }
              
              //parse gotten date as GMT time and change to GMT+2
              let date = moment(dayInfo.date).tz("Europe/London");
              date = date.tz("Europe/Helsinki").format("YYYY-MM-DD");
              
              let dayObj = {date:date,status:status};
              dayList.push(dayObj);
            }

            //gets defaults adds possible status on top
            const combinedWeek = defaultWeek.map((item, i, arr) => ({
              ...item,
              ...dayList.find((findItem) => findItem.date === item.date)
            }));
            console.log("SCHEDULE_WEEK combined",combinedWeek);

            dayListObj = {weekNum:weekNum,weekBegin:begin,weekEnd:end,days:combinedWeek};
            res.status(200).json(dayListObj);
          }
        })
    )
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};

/*
*  Get track status for a day
*/
exports.trackInfoForDay = async (req, res) => {
  //Selecting track-status for a specific day from the DB and sending it to the front end
  //date/:date/track/:id
  console.log("SCHEDULE_TRACK "+req.params.date);
  console.log("SCHEDULE_TRACK "+req.params.id);
  let date = new Date(req.params.date);
  
  //check for valid date object
  if(date instanceof Date && !isNaN(date.getTime())){
    if(req.params.id !== undefined){
      //get single track
      //works with localhost:3000/api/date/2020-02-20/track/Shooting Track 1
      (
        knex          
          .with('getTOState', knex.raw(
            'select * '+
            'from track_supervision '+
            'inner join track on track.id = track_supervision.track_id '+
            'where track.name=? '+
            'order by updated_at',
            [req.params.id])
          )
          .select(
            'range.name as rangeName',
            'track.name','track.description',
            'scheduled_range_supervision.supervisor_id as rangeOfficer',
            'getTOState.track_supervisor',
            'getTOState.notice',
            //'getTOState.*'
          )
          .from('range')
          .join('range_reservation', 'range.id', '=', 'range_reservation.range_id')
          .join('track', 'range.id', '=', 'track.range_id')
          .leftJoin('scheduled_range_supervision', 'range_reservation.id', '=', 'range_reservation_id')
          .leftJoin('getTOState' ,'scheduled_range_supervision.id' , '=', 'getTOState.scheduled_range_supervision_id')
          .where('date', req.params.date)
          //atm track name needs to be exact e.g. 'Shooting Track 1'
          .where('track.name', req.params.id)
          //TODO remove hard coded range below
          .where('range.id', config.development.range_id)

          .then((rows) => {
            console.log("Got rows: "+rows.length);
            if(rows.length === 0){
              res.status(400).json({
                err: "No results found. Either date or track name not found."
              });
            }
            else {
              console.log(rows);
              const trackInfo = rows.pop()
              console.log(trackInfo);
              
              let roState = (trackInfo.rangeOfficer !== null) ? true : false;
              let toState = trackInfo.track_supervisor; //absent/present/closed
              console.log(roState);
              var trackObj = {trackName:trackInfo.name,description:trackInfo.description,trackOfficer:toState,rangeOfficer:roState,notice:trackInfo.notice};
            
              res.status(200).json({
                track: trackObj
              });
            }
          })
      )
    }
    else{
      res.status(400).json({
        err: "get all not implemented"
      });
    }
  }
  else{
    res.status(400).json({
      err: "Invalid date"
    });
  }
};