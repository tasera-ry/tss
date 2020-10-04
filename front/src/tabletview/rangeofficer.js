import React, { useState, useEffect } from "react";

import './rangeofficer.css';

// Material UI components
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker
} from '@material-ui/pickers';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// Translations
import * as data from '../texts/texts.json';

// Date handling
import moment from 'moment';

// Axios for backend calls
import axios from 'axios';

// Login validation
import { validateLogin, rangeSupervision } from "../utils/Utils";

import socketIOClient from "socket.io-client";

/*
  Styles not in the rangeofficer.js file
*/
const colors = {
  green: '#658f60',
  red: '#c97b7b',
  white: '#f2f0eb',
  orange: '#f2c66d',
  lightgreen: '#b2d9ad',
  blue: '#95d5db'
}
const rowStyle = {
  flexDirection: "row",
  display: "flex",
  justifyContent: "center"
}
const trackRowStyle = {
  flexDirection: "row",
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap"
}
const greenButtonStyle = {
  fontSize: 17,
  backgroundColor: colors.green,
  borderRadius: 50,
  width:250,
  height:100
}
const orangeButtonStyle = {
  fontSize: 17,
  backgroundColor: colors.orange,
  borderRadius: 50,
  width:250,
  height:100
}
const redButtonStyle = {
  fontSize: 17,
  backgroundColor: colors.red,
  borderRadius: 50,
  width:250,
  height:100
}
const saveButtonStyle = {
  backgroundColor:'#5f77a1'
}
const cancelButtonStyle = {
  backgroundColor:'#ede9e1'
}
const simpleButton = {
  borderRadius:15
}
const rangeStyle = {
  textAlign: "center",
  padding: 20,
  marginLeft: 15
}
const dialogStyle = {
  backgroundColor: "#f2f0eb"
}

//shooting track rows
const TrackRows = ({tracks, setTracks, scheduleId, tablet, fin, socket}) => {
  return (
    tracks.map(track =>
               <div key={track.id}>
                 <div style={rangeStyle}>
                   <Typography
                     align="center">
                     {track.name}
                   </Typography>

                   <TrackButtons 
                    track={track}
                    tracks={tracks}
                    setTracks={setTracks}
                    scheduleId={scheduleId}
                    tablet={tablet}
                    fin={fin}
                    socket={socket}/>
                 </div>
               </div>
              )
  )
};

const TrackButtons = ({track, tracks, setTracks, scheduleId, tablet, fin}) => {
  // get this somewhere else
  const buttonStyle = {
    backgroundColor:`${track.color}`,
    borderRadius: 30,
    width: 100
  };
  const [buttonColor, setButtonColor] = useState(track.color);
  let text = tablet.Green[fin];

  if (track.trackSupervision === "absent") {
    text = tablet.White[fin];
  }
  else if (track.trackSupervision === "closed") {
    text = tablet.Red[fin];
  }

  const HandleClick = () => {
    let newSupervision = "absent";
    let token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    track.color = colors.white;

    if (track.trackSupervision === "absent") {
      newSupervision = "closed";
      track.color = colors.red;
    }
    else if (track.trackSupervision === "closed") {
      newSupervision = "present";
      track.color = colors.green;
    }

    let notice = track.notice;
    if (notice === null) {
      //undefined gets removed in object
      notice = undefined;
    }

    let params = {
      track_supervisor: newSupervision,
      notice: notice
    };

    let srsp = '';
    //if scheduled track supervision exists -> put otherwise -> post
    if (track.scheduled) {
      srsp = "/" + scheduleId + '/' + track.id;
      axios.put(
        "/api/track-supervision" + srsp,
        params,
        config
      ).catch(error => {
          console.log(error)
      }).then(res => {
        if(res) {
          track.trackSupervision = newSupervision;
          setButtonColor(track.color);
        }
      });
    }
    else {
      params = {
        ...params,
        scheduled_range_supervision_id: scheduleId,
        track_id: track.id
      };

      axios.post(
        "/api/track-supervision",
        params,
        config
      ).catch(error => {
          console.log(error)
      }).then(res => {
        if(res) {
          track.scheduled = res.data[0];
          track.trackSupervision = newSupervision;
          setButtonColor(track.color);
        }
      });
    }
  };

  return (
    <Button
      style={buttonStyle}
      size='large'
      variant={'contained'}
      onClick={HandleClick}>
      {text}
    </Button>
  );
};

async function getColors(tracks, setTracks) {
  const copy = [...tracks]

  for(let i=0; i<copy.length; i++) {
    let obj = copy[i];
    if(copy[i].trackSupervision==="present") {obj.color=colors.green}
    else if(copy[i].trackSupervision==="closed") {obj.color=colors.red}
    else if(copy[i].trackSupervision==="absent") {obj.color=colors.white}
    else if(copy[i].trackSupervision==="en route") {obj.color=colors.orange}
  }

  setTracks(copy)
}

async function getData(tablet, fin, setHours, tracks, setTracks, setStatusText, setStatusColor, setScheduleId, setReservationId, setRangeSupervisionScheduled) {

  let date = moment(Date.now()).format("YYYY-MM-DD");

  await fetch(`/api/datesupreme/${date}`)
    .then(res => res.json())
    .then(response => {
      // console.log(response);
      setScheduleId(response.scheduleId);
      setReservationId(response.reservationId);
      setRangeSupervisionScheduled(response.rangeSupervisionScheduled);
      setHours({"start": moment(response.open, 'h:mm').format('HH:mm'),
                "end": moment(response.close, 'h:mm').format('HH:mm')});

      if (response.rangeSupervision === 'present') {
        setStatusText(tablet.SuperGreen[fin]);
        setStatusColor(colors.green);
      }
      else if (response.rangeSupervision === 'en route') {
        setStatusText(tablet.SuperOrange[fin]);
        setStatusColor(colors.orange);
      }
      else if (response.rangeSupervision === 'absent') {
        setStatusText(tablet.SuperWhite[fin]);
        setStatusColor(colors.white);
      }
      else if (response.rangeSupervision === 'closed') {
        setStatusText(tablet.Red[fin]);
        setStatusColor(colors.red);
      }
      else if (response.rangeSupervision === 'confirmed') {
        setStatusText(tablet.SuperLightGreen[fin]);
        setStatusColor(colors.lightgreen);
      }
      else if (response.rangeSupervision === 'not confirmed') {
        setStatusText(tablet.SuperBlue[fin]);
        setStatusColor(colors.blue);
      }
      else {
        setStatusText(tablet.SuperWhite[fin]);
	      setStatusColor(colors.white);
      }
      getColors(response.tracks, setTracks);
    });
};

const TimePick = ({tablet, fin, scheduleId, hours, setHours, dialogOpen, setDialogOpen}) => {
  const [newHours, setNewHours] = useState({...hours});
  const [errorMessage, setErrorMessage] = useState();
  const [startDate, setStartDate] = useState(new Date(0,0,0, hours.start.split(":")[0], hours.start.split(":")[1], 0))
  const [endDate, setEndDate] = useState(new Date(0,0,0, hours.end.split(":")[0], hours.end.split(":")[1], 0))

  async function handleTimeChange(){
    if(startDate===null || endDate===null) {
      setErrorMessage(tablet.Error[fin])
      return
    }

    const start = startDate.toTimeString().split(" ")[0].slice(0, 5)
    const end = endDate.toTimeString().split(" ")[0].slice(0, 5)
    console.log(start, end)

    let query = "/api/schedule/" + scheduleId;
    let token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    await axios.put(query,
                    {
                      open: start,
                      close: end
                    }, config)
      .then(res => {
        if(res) {
          setHours({"start": start, "end": end})
          setDialogOpen(false)
        }
      })
      .catch(error => {
        console.log(error)
        setErrorMessage(tablet.Error[fin])
      })
  }

  return (
    <div>
      <Dialog
        open={dialogOpen}
        aria-labelledby="title">
        <DialogTitle id="title" style={dialogStyle}>{tablet.PickTime[fin]}</DialogTitle>
        <DialogContent style={dialogStyle}>

          <div style={rowStyle}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>

              <KeyboardTimePicker
                margin="normal"
                id="starttime"
                label={tablet.Start[fin]}
                ampm={false}
                value={startDate}
                onChange={date => setStartDate(date)}
                minutesStep={5}
              />
              &nbsp;
              <KeyboardTimePicker
                margin="normal"
                id="endtime"
                label={tablet.End[fin]}
                ampm={false}
                value={endDate}
                onChange={date => setEndDate(date)}
                minutesStep={5}
              />

            </MuiPickersUtilsProvider>
          </div>

          <br />
          {errorMessage ?
           <Typography
             align="center"
             style={{color: "#c23a3a"}}>
             {errorMessage}
           </Typography>
           : ""}

        </DialogContent>

        <DialogActions style={dialogStyle}>
          <Button
            variant="contained"
            onClick={()=> setDialogOpen(false)}
            style={cancelButtonStyle}>
            {tablet.Cancel[fin]}
          </Button>

          <Button
            variant="contained"
            onClick={() => handleTimeChange()}
            style={saveButtonStyle}>
            {tablet.Save[fin]}
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  )
}

const Tabletview = () => {
  const [statusColor, setStatusColor] = useState();
  const [socket, setSocket] = useState();
  const [statusText, setStatusText] = useState();
  const [hours, setHours] = useState({});
  const [tracks, setTracks] = useState([]);
  const [scheduleId, setScheduleId] = useState();
  const [reservationId, setReservationId] = useState();
  const [rangeSupervisionScheduled, setRangeSupervisionScheduled] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const role = localStorage.getItem("role");
  const fin = localStorage.getItem("language");
  const {tablet} = data;
  let today = moment().format("DD.MM.YYYY");

  const statusStyle = {
    color: "black",
    backgroundColor: statusColor,
    borderRadius: 3,
    width: 300
  };

  /*
    Basically the functional component version of componentdidmount
  */
  useEffect(() => {
    validateLogin()
      .then(logInSuccess => {
        if (logInSuccess) {
          getData(tablet, fin, setHours, tracks, setTracks, setStatusText, setStatusColor, setScheduleId, setReservationId, setRangeSupervisionScheduled);
        }
        // Login failed, redirect to weekview
        else {
          RedirectToWeekview();
        }
      })
    setSocket(socketIOClient().on('rangeUpdate', (msg) => {
      console.log(msg)
      setStatusColor(msg.color);
      setStatusText(msg.text);
      if(rangeSupervisionScheduled === false){
        setRangeSupervisionScheduled(true);
      }
    }))
  }, []);

  function RedirectToWeekview(){
    window.location.href="/";
  };

  const HandlePresentClick = () => {
    socket.emit('rangeUpdate', {
      status: "present", 
      color: colors.green, 
      text: tablet.SuperGreen[fin]
    })
    updateSupervisor("present", colors.green, tablet.SuperGreen[fin]);
  }

  const HandleEnRouteClick = () => {
    socket.emit('rangeUpdate', {
      status: "en route", 
      color: colors.orange, 
      text: tablet.SuperOrange[fin]
    })
    updateSupervisor("en route", colors.orange, tablet.SuperOrange[fin]);
  }

  const HandleClosedClick = () => {
    socket.emit('rangeUpdate', {
      status: "closed", 
      color: colors.red, 
      text: tablet.Red[fin]
    })
    updateSupervisor("closed", colors.red, tablet.Red[fin]);
  }

  async function updateSupervisor(status, color, text) {
    let token = localStorage.getItem("token");

    const res = await rangeSupervision(reservationId,scheduleId,status,rangeSupervisionScheduled,token);
    if(res === true){
      setStatusColor(color);
      setStatusText(text);

      if(rangeSupervisionScheduled === false){
        setRangeSupervisionScheduled(true);
      }
    }
  }

  return (
    <div>
      <Typography
        variant="body1"
        align="center">
        <br />
        {today}
      </Typography>

      <Typography
        variant="body1"
        align="center">
        {tablet.Open[fin]}:
        &nbsp;

        <Button
          size="small"
          variant="outlined"
          style={simpleButton}
          onClick={()=> setDialogOpen(true)}>
          {hours.start} - {hours.end}
        </Button>

      </Typography>
      &nbsp;

      {dialogOpen ?
       <TimePick tablet={tablet} fin={fin} scheduleId={scheduleId}
                 hours={hours} setHours={setHours}
                 dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
       : ""}

      <div style={rowStyle}>
        <Button
          style={statusStyle}
          size='large'
          variant='outlined'
          disabled>
          {statusText}
        </Button>
      </div>

      <Typography
        variant="body1"
        align="center">
        <br />
        {tablet.HelperFirst[fin]}
      </Typography>

      <div style={rowStyle}>
        <Button
          style={greenButtonStyle}
          size='large'
          variant='contained'
          onClick={HandlePresentClick}>
          {tablet.Green[fin]}
        </Button>
        &nbsp;
        <Button
          style={orangeButtonStyle}
          size='large'
          variant='contained'
          onClick={HandleEnRouteClick}>
          {tablet.Orange[fin]}
        </Button>
        &nbsp;
        <Button
          style={redButtonStyle}
          size='large'
          variant='contained'
          onClick={HandleClosedClick}>
          {tablet.Red[fin]}
        </Button>
      </div>

      &nbsp;
      <Typography
        variant="body1"
        align="center">
        {tablet.HelperSecond[fin]}
      </Typography>

      <div style={trackRowStyle}>
        <TrackRows tracks={tracks}
                   setTracks={setTracks}
                   scheduleId={scheduleId}
                   tablet={tablet}
                   fin={fin}
                   socket={socket} />
      </div>
    </div>

  );
};

export default Tabletview;
