import React, { useState, useEffect } from 'react';

import './rangeofficer.css';

// Material UI components
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from '@material-ui/pickers';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// Translations

// Date handling
import moment from 'moment';

// Axios for backend calls
import axios from 'axios';

// Login validation
import socketIOClient from 'socket.io-client';
import { validateLogin, rangeSupervision } from '../utils/Utils';

import data from '../texts/texts.json';

// Submitting track usage statistics
import { TrackStatistics } from '../TrackStatistics/TrackStatistics';

/*
  Styles not in the rangeofficer.js file
*/
const colors = {
  green: '#658f60',
  red: '#c97b7b',
  white: '#f2f0eb',
  orange: '#f2c66d',
  lightgreen: '#b2d9ad',
  blue: '#95d5db',
};
const rowStyle = {
  flexDirection: 'row',
  display: 'flex',
  justifyContent: 'center',
};
const trackRowStyle = {
  flexDirection: 'row',
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
};
const greenButtonStyle = {
  fontSize: 17,
  backgroundColor: colors.green,
  borderRadius: 50,
  width: 250,
  height: 100,
  margin: 8,
};
const orangeButtonStyle = {
  fontSize: 17,
  backgroundColor: colors.orange,
  borderRadius: 50,
  width: 250,
  height: 100,
  margin: 8,
};
const redButtonStyle = {
  fontSize: 17,
  backgroundColor: colors.red,
  borderRadius: 50,
  width: 250,
  height: 100,
  margin: 8,
};
const saveButtonStyle = {
  backgroundColor: '#5f77a1',
};
const cancelButtonStyle = {
  backgroundColor: '#ede9e1',
};
const simpleButton = {
  padding: '2px 10px',
  borderRadius: 15,
  fontSize: '1.2rem',
};
const rangeStyle = {
  textAlign: 'center',
  margin: 10,
  marginTop: 0,
};
const dialogStyle = {
  backgroundColor: '#f2f0eb',
};
const rangediv = {
  width: 300,
};

// shooting track rows
const TrackRows = ({
  tracks,
  setTracks,
  scheduleId,
  tablet,
  fin,
  socket,
}) => (
  tracks.map((track) => (
    <div key={track.id} style={rangediv}>
      <div style={rangeStyle}>
        <Typography
          variant="h6"
          align="center"
        >
          {track.name}
          {' '}
          —
          {' '}
          {track.short_description}
        </Typography>

        <TrackButtons
          track={track}
          tracks={tracks}
          setTracks={setTracks}
          scheduleId={scheduleId}
          tablet={tablet}
          fin={fin}
          socket={socket}
        />
      </div>
    </div>
  ))
);

const TrackButtons = ({
  track, scheduleId, tablet, fin, socket,
}) => {
  // get this somewhere else
  const buttonStyle = {
    backgroundColor: `${track.color}`,
    borderRadius: 30,
    width: 230,
  };
  let text = tablet.Green[fin];
  const [buttonColor, setButtonColor] = useState(track.color);
  const [textState, setTextState] = useState(text);
  const [supervision, setSupervision] = useState(text);

  if (track.trackSupervision === 'absent') {
    text = tablet.White[fin];
  } else if (track.trackSupervision === 'closed') {
    text = tablet.Red[fin];
  }

  socket.on('trackUpdate', (msg) => {
    if (msg.id === track.id) {
      if (msg.super === 'present') {
        track.trackSupervision = 'absent'; // eslint-disable-line
        setButtonColor(colors.green);
        setTextState(tablet.Green[fin]);
        setSupervision('absent');
      } else if (msg.super === 'closed') {
        track.trackSupervision = 'present'; // eslint-disable-line
        setButtonColor(colors.red);
        setTextState(tablet.Red[fin]);
        setSupervision('present');
      } else if (msg.super === 'absent') {
        track.trackSupervision = 'closed'; // eslint-disable-line
        setButtonColor(colors.white);
        setTextState(tablet.White[fin]);
        setSupervision('closed');
      }
      // setButtonColor(track.color)
      // setTextState(text)
    }
  });
  const HandleClick = () => {
    let newSupervision = 'absent';
    setSupervision('absent');
    track.color = colors.white; // eslint-disable-line
    setTextState(tablet.White[fin]);

    if (track.trackSupervision === 'absent') {
      newSupervision = 'closed';
      setSupervision('closed');
      track.color = colors.red; // eslint-disable-line
      setTextState(tablet.Red[fin]);
    } else if (track.trackSupervision === 'closed') {
      newSupervision = 'present';
      setSupervision('present');
      track.color = colors.green; // eslint-disable-line
      setTextState(tablet.Green[fin]);
    }

    let { notice } = track;
    if (notice === null) {
      // undefined gets removed in object
      notice = undefined;
    }

    let params = {
      track_supervisor: newSupervision,
      notice,
    };

    // if scheduled track supervision exists -> put otherwise -> post
    if (track.scheduled) {
      axios.put(
        `/api/track-supervision/${scheduleId}/${track.id}`,
        params,
      ).catch((error) => {
        console.log(error);
      }).then((res) => {
        if (res) {
          track.trackSupervision = newSupervision; // eslint-disable-line
          socket.emit('trackUpdate', {
            super: track.trackSupervision,
            id: track.id,
          });
          setButtonColor(track.color);
        }
      });
    } else {
      params = {
        ...params,
        scheduled_range_supervision_id: scheduleId,
        track_id: track.id,
      };

      axios.post(
        '/api/track-supervision',
        params,
      ).catch((error) => {
        console.log(error);
      }).then((res) => {
        if (res) {
          track.scheduled = res.data[0]; // eslint-disable-line
          track.trackSupervision = newSupervision; // eslint-disable-line
          socket.emit('trackUpdate', {
            super: track.trackSupervision,
            id: track.id,
          });
          setButtonColor(track.color);
        }
      });
    }
  };
  return (
    <div>
      <Button
        style={{ ...buttonStyle, backgroundColor: buttonColor }}
        size="large"
        variant="contained"
        onClick={HandleClick}
        data-testid={track.id}
      >
        {textState}
      </Button>
      <TrackStatistics track={track} supervision={supervision} />
    </div>
  );
};

async function getColors(tracks, setTracks) {
  const copy = [...tracks];

  for (let i = 0; i < copy.length; i += 1) {
    const obj = copy[i];
    if (copy[i].trackSupervision === 'present') { obj.color = colors.green; } else if (copy[i].trackSupervision === 'closed') { obj.color = colors.red; } else if (copy[i].trackSupervision === 'absent') { obj.color = colors.white; } else if (copy[i].trackSupervision === 'en route') { obj.color = colors.orange; }
  }
  setTracks(copy);
}

async function getData(
  tablet,
  fin,
  setHours,
  tracks,
  setTracks,
  setStatusText,
  setStatusColor,
  setScheduleId,
  setReservationId,
  setRangeSupervisionScheduled,
) {
  const date = moment(Date.now()).format('YYYY-MM-DD');

  await fetch(`/api/datesupreme/${date}`)
    .then((res) => res.json())
    .then((response) => {
      // console.log(response);
      setScheduleId(response.scheduleId);
      setReservationId(response.reservationId);
      setRangeSupervisionScheduled(response.rangeSupervisionScheduled);
      setHours({
        start: moment(response.open, 'h:mm').format('HH:mm'),
        end: moment(response.close, 'h:mm').format('HH:mm'),
      });
      if (response.rangeSupervision === 'present') {
        setStatusText(tablet.SuperGreen[fin]);
        setStatusColor(colors.green);
      } else if (response.rangeSupervision === 'en route') {
        setStatusText(tablet.SuperOrange[fin]);
        setStatusColor(colors.orange);
      } else if (response.rangeSupervision === 'absent') {
        setStatusText(tablet.SuperWhite[fin]);
        setStatusColor(colors.white);
      } else if (response.rangeSupervision === 'closed') {
        setStatusText(tablet.Red[fin]);
        setStatusColor(colors.red);
      } else if (response.rangeSupervision === 'confirmed') {
        setStatusText(tablet.SuperLightGreen[fin]);
        setStatusColor(colors.lightgreen);
      } else if (response.rangeSupervision === 'not confirmed') {
        setStatusText(tablet.SuperBlue[fin]);
        setStatusColor(colors.blue);
      } else {
        setStatusText(tablet.SuperWhite[fin]);
        setStatusColor(colors.white);
      }
      getColors(response.tracks, setTracks);
    });
}

const TimePick = ({
  tablet, fin, scheduleId, hours, setHours, dialogOpen, setDialogOpen,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const [startDate, setStartDate] = useState(new Date(0, 0, 0, hours.start.split(':')[0], hours.start.split(':')[1], 0));
  const [endDate, setEndDate] = useState(new Date(0, 0, 0, hours.end.split(':')[0], hours.end.split(':')[1], 0));

  async function handleTimeChange() {
    if (startDate === null || endDate === null) {
      setErrorMessage(tablet.Error[fin]);
      return;
    }

    const start = startDate.toTimeString().split(' ')[0].slice(0, 5);
    const end = endDate.toTimeString().split(' ')[0].slice(0, 5);
    console.log(start, end);

    const query = `/api/schedule/${scheduleId}`;

    await axios.put(query,
      {
        open: start,
        close: end,
      })
      .then((res) => {
        if (res) {
          setHours({ start, end });
          setDialogOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(tablet.Error[fin]);
      });
  }

  return (
    <div>
      <Dialog
        open={dialogOpen}
        aria-labelledby="title"
      >
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
                onChange={(date) => setStartDate(date)}
                minutesStep={5}
              />
              &nbsp;
              <KeyboardTimePicker
                margin="normal"
                id="endtime"
                label={tablet.End[fin]}
                ampm={false}
                value={endDate}
                onChange={(date) => setEndDate(date)}
                minutesStep={5}
              />

            </MuiPickersUtilsProvider>
          </div>

          <br />
          {errorMessage
            ? (
              <Typography
                align="center"
                style={{ color: '#c23a3a' }}
              >
                {errorMessage}
              </Typography>
            )
            : ''}

        </DialogContent>

        <DialogActions style={dialogStyle}>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            style={cancelButtonStyle}
          >
            {tablet.Cancel[fin]}
          </Button>

          <Button
            variant="contained"
            onClick={() => handleTimeChange()}
            style={saveButtonStyle}
          >
            {tablet.Save[fin]}
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  );
};

const Tabletview = () => {
  const [statusColor, setStatusColor] = useState();
  const [statusText, setStatusText] = useState();
  const [hours, setHours] = useState({});
  const [tracks, setTracks] = useState([]);
  const [scheduleId, setScheduleId] = useState();
  const [reservationId, setReservationId] = useState();
  const [rangeSupervisionScheduled, setRangeSupervisionScheduled] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [socket, setSocket] = useState();
  const fin = localStorage.getItem('language');
  const { tablet } = data;
  const today = moment().format('DD.MM.YYYY');

  const statusStyle = {
    color: 'black',
    backgroundColor: statusColor,
    borderRadius: 3,
    width: 400,
    margin: 4,
    marginBottom: 0,
  };

  /*
    Basically the functional component version of componentdidmount
  */

  function RedirectToWeekview() {
    window.location.href = '/';
  }

  useEffect(() => {
    validateLogin()
      .then((logInSuccess) => {
        if (logInSuccess) {
          getData(tablet,
            fin,
            setHours,
            tracks,
            setTracks,
            setStatusText,
            setStatusColor,
            setScheduleId,
            setReservationId,
            setRangeSupervisionScheduled);
        } else { // Login failed, redirect to weekview
          RedirectToWeekview();
        }
      });

    setSocket(socketIOClient()
      .on('rangeUpdate', (msg) => {
        setStatusColor(msg.color);
        setStatusText(msg.text);
        if (rangeSupervisionScheduled === false) {
          setRangeSupervisionScheduled(true);
        }
      })
      .on('refresh', () => {
        window.location.reload();
      }));

    setTimeout(() => {
      window.location.reload();
    }, 3 * 60 * 60 * 1000); // 3 hours
  }, []); // eslint-disable-line

  async function updateSupervisor(status, color, text) {
    const res = await rangeSupervision(reservationId,
      scheduleId,
      status,
      rangeSupervisionScheduled,
      null);

    if (res === true) {
      setStatusColor(color);
      setStatusText(text);

      if (rangeSupervisionScheduled === false) {
        setRangeSupervisionScheduled(true);
      }
    }
  }

  const HandlePresentClick = () => {
    socket.emit('rangeUpdate', {
      status: 'present',
      color: colors.green,
      text: tablet.SuperGreen[fin],
    });
    updateSupervisor('present', colors.green, tablet.SuperGreen[fin]);
  };

  const HandleEnRouteClick = () => {
    socket.emit('rangeUpdate', {
      status: 'en route',
      color: colors.orange,
      text: tablet.SuperOrange[fin],
    });
    updateSupervisor('en route', colors.orange, tablet.SuperOrange[fin]);
  };

  const HandleClosedClick = () => {
    socket.emit('rangeUpdate', {
      status: 'closed',
      color: colors.red,
      text: tablet.Red[fin],
    });
    updateSupervisor('closed', colors.red, tablet.Red[fin]);
  };
  return (
    <div>
      <div className="Text">
        {today}
      </div>

      <Typography
        variant="h5"
        align="center"
      >
        {tablet.Open[fin]}
        :
        &nbsp;

        <Button
          size="medium"
          variant="outlined"
          style={simpleButton}
          onClick={() => setDialogOpen(true)}
        >
          {hours.start}
          -
          {hours.end}
        </Button>

      </Typography>

      {dialogOpen
        ? (
          <TimePick
            tablet={tablet}
            fin={fin}
            scheduleId={scheduleId}
            hours={hours}
            setHours={setHours}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
          />
        )
        : ''}

      <div className="Status" style={rowStyle}>
        <Button
          style={statusStyle}
          size="large"
          variant="outlined"
          disabled
          data-testid="rangeOfficerStatus"
        >
          {statusText}
        </Button>
      </div>

      <div className="Text">
        {tablet.HelperFirst[fin]}
      </div>

      <div style={rowStyle}>
        <Button
          style={greenButtonStyle}
          size="large"
          variant="contained"
          onClick={HandlePresentClick}
          data-testid="tracksupervisorPresent"
        >
          {tablet.Green[fin]}
        </Button>
        <Button
          style={orangeButtonStyle}
          size="large"
          variant="contained"
          onClick={HandleEnRouteClick}
          data-testid="tracksupervisorOnWay"
        >
          {tablet.Orange[fin]}
        </Button>
        <Button
          style={redButtonStyle}
          size="large"
          variant="contained"
          onClick={HandleClosedClick}
          data-testid="tracksupervisorClosed"
        >
          {tablet.Red[fin]}
        </Button>
      </div>

      <div className="Text">
        {tablet.HelperSecond[fin]}
      </div>

      <div style={trackRowStyle}>
        <TrackRows
          tracks={tracks}
          setTracks={setTracks}
          scheduleId={scheduleId}
          tablet={tablet}
          fin={fin}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default Tabletview;
