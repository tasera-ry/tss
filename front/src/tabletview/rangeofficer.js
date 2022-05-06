import React, { useState, useEffect } from 'react';

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
import { validateLogin, updateRangeSupervision } from '../utils/Utils';

import data from '../texts/texts.json';

// Submitting track usage statistics
import { TrackStatistics } from '../TrackStatistics/TrackStatistics';

//Receiving possible info messages
import InfoBox from '../infoBox/InfoBox';

import classNames from 'classnames';
import colors from '../colors.module.scss';
import css from './rangeofficer.module.scss';

const classes = classNames.bind(css);

// shooting track rows
const TrackRows = ({ tracks, setTracks, scheduleId, tablet, fin, socket }) =>
  tracks.map((track) => (
    <div key={track.id} className={classes(css.rangediv)}>
      <div className={classes(css.rangeStyle)}>
        <Typography variant="h6" align="center">
          {track.name} — {track.short_description}
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
  ));

const TrackButtons = ({ track, scheduleId, tablet, fin, socket }) => {

  const [buttonColor, setButtonColor] = useState(track.color);

  const supervisorState = track.scheduled.track_supervisor;
  let supervisorStateTablet;
  if (supervisorState === 'present') supervisorStateTablet = 'Green';
  else if (supervisorState === 'closed') supervisorStateTablet = 'Red';
  else supervisorStateTablet = 'White';

  const [textState, setTextState] = useState(tablet[supervisorStateTablet][fin]);
  const [supervision, setSupervision] = useState(supervisorState);

  socket.on('trackUpdate', (msg) => {
    if (msg.id === track.id) {
      if (msg.super === 'present') {
        track.trackSupervision = 'absent'; // eslint-disable-line
        setButtonColor(colors.green);
        setTextState(tablet.Green[fin]);
        setSupervision('absent');
      } else if (msg.super === 'closed') {
        track.trackSupervision = 'present'; // eslint-disable-line
        setButtonColor(colors.redLight);
        setTextState(tablet.Red[fin]);
        setSupervision('present');
      } else if (msg.super === 'absent') {
        track.trackSupervision = 'closed'; // eslint-disable-line
        setButtonColor(colors.white);
        setTextState(tablet.White[fin]);
        setSupervision('closed');
      }
    }
  });
  const HandleClick = () => {
    let newSupervision = 'absent';
    setSupervision('absent');
    track.color = colors.white; // eslint-disable-line
    setTextState(tablet.White[fin]);

    if (track.trackSupervision === 'present') {
      newSupervision = 'closed';
      setSupervision('closed');
      track.color = colors.redLight; // eslint-disable-line
      setTextState(tablet.Red[fin]);
    } else if (track.trackSupervision === 'absent') {
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
      axios
        .put(`/api/track-supervision/${scheduleId}/${track.id}`, params)
        .catch((error) => {
          console.log(error);
        })
        .then((res) => {
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

      axios
        .post('/api/track-supervision', params)
        .catch((error) => {
          console.log(error);
        })
        .then((res) => {
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
        className = {classes(css.buttonStyle)}
        style={{backgroundColor: buttonColor}}
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
    if (copy[i].trackSupervision === 'present') {
      obj.color = colors.green;
    } else if (copy[i].trackSupervision === 'closed') {
      obj.color = colors.redLight;
    } else if (copy[i].trackSupervision === 'absent') {
      obj.color = colors.white;
    } else if (copy[i].trackSupervision === 'en route') {
      obj.color = colors.orange;
    }
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
        setStatusColor(colors.redLight);
      } else if (response.rangeSupervision === 'confirmed') {
        setStatusText(tablet.SuperLightGreen[fin]);
        setStatusColor(colors.greenLight);
      } else if (response.rangeSupervision === 'not confirmed') {
        setStatusText(tablet.SuperBlue[fin]);
        setStatusColor(colors.turquoise);
      } else {
        setStatusText(tablet.SuperWhite[fin]);
        setStatusColor(colors.white);
      }
      getColors(response.tracks, setTracks);
    });
}

const TimePick = ({
  tablet,
  fin,
  scheduleId,
  hours,
  setHours,
  dialogOpen,
  setDialogOpen,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const [startDate, setStartDate] = useState(
    new Date(0, 0, 0, hours.start.split(':')[0], hours.start.split(':')[1], 0),
  );
  const [endDate, setEndDate] = useState(
    new Date(0, 0, 0, hours.end.split(':')[0], hours.end.split(':')[1], 0),
  );

  async function handleTimeChange() {
    if (startDate === null || endDate === null) {
      setErrorMessage(tablet.Error[fin]);
      return;
    }

    const start = startDate.toTimeString().split(' ')[0].slice(0, 5);
    const end = endDate.toTimeString().split(' ')[0].slice(0, 5);
    console.log(start, end);

    const query = `/api/schedule/${scheduleId}`;

    await axios
      .put(query, {
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
      <Dialog open={dialogOpen} aria-labelledby="title">
        <DialogTitle id="title" className={classes(css.dialogStyle)}>
          {tablet.PickTime[fin]}
        </DialogTitle>
        <DialogContent className={classes(css.dialogStyle)}>
          <div className={classes(css.rowStyle)}>
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
          {errorMessage ? (
            <Typography align="center" style={{ color: colors.redLight }}>
              {errorMessage}
            </Typography>
          ) : (
            ''
          )}
        </DialogContent>

        <DialogActions className={classes(css.dialogStyle)}>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            className={classes(css.cancelButtonStyle)}
          >
            {tablet.Cancel[fin]}
          </Button>

          <Button
            variant="contained"
            onClick={() => handleTimeChange()}
            className={classes(css.saveButtonStyle)}
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
  const date = moment(Date.now()).format('YYYY-MM-DD');
  const today = moment().format('DD.MM.YYYY');

  /*
    Basically the functional component version of componentdidmount
  */

  function RedirectToWeekview() {
    window.location.href = '/';
  }

  useEffect(() => {
    validateLogin().then((logInSuccess) => {
      if (logInSuccess) {
        getData(
          //data,
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
        );
      } else {
        // Login failed, redirect to weekview
        RedirectToWeekview();
      }
    });

    setSocket(
      socketIOClient()
        .on('rangeUpdate', (msg) => {
          setStatusColor(msg.color);
          setStatusText(msg.text);
          if (rangeSupervisionScheduled === false) {
            setRangeSupervisionScheduled(true);
          }
        })
        .on('refresh', () => {
          window.location.reload();
        }),
    );

    setTimeout(() => {
      window.location.reload();
    }, 3 * 60 * 60 * 1000); // 3 hours
  }, [date]); // eslint-disable-line

  async function updateSupervisor(status, color, text) {
    const res = await updateRangeSupervision(
      reservationId,
      scheduleId,
      status,
      rangeSupervisionScheduled,
      null,
    );

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
      color: colors.redLight,
      text: tablet.Red[fin],
    });
    updateSupervisor('closed', colors.redLight, tablet.Red[fin]);
  };
  return (
    <div>
      <InfoBox tabletMode={true} />
      <div className={classes(css.Text)}>{today}</div>

      <Typography variant="h5" align="center">
        {tablet.Open[fin]}: &nbsp;
        <Button
          size="medium"
          variant="outlined"
          className={classes(css.simpleButton)}
          onClick={() => setDialogOpen(true)}
        >
          {hours.start}-{hours.end}
        </Button>
      </Typography>

      {dialogOpen ? (
        <TimePick
          tablet={tablet}
          fin={fin}
          scheduleId={scheduleId}
          hours={hours}
          setHours={setHours}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      ) : (
        ''
      )}

      <div className={classes(css.Status, css.rowStyle)}>
        <Button
          className = {classes(css.statusStyle)}
          style={{color: colors.black, backgroundColor: statusColor}}
          size="large"
          variant="outlined"
          disabled
          data-testid="rangeOfficerStatus"
        >
          {statusText}
        </Button>
      </div>

      <div className={classes(css.Text)}>{tablet.HelperFirst[fin]}</div>

      <div className={classes(css.rowStyle)}>
        <Button
          className={classes(css.greenButtonStyle)}
          size="large"
          variant="contained"
          onClick={HandlePresentClick}
          data-testid="tracksupervisorPresent"
        >
          {tablet.Green[fin]}
        </Button>
        <Button
          className={classes(css.orangeButtonStyle)}
          size="large"
          variant="contained"
          onClick={HandleEnRouteClick}
          data-testid="tracksupervisorOnWay"
        >
          {tablet.Orange[fin]}
        </Button>
        <Button
          className={classes(css.redButtonStyle)}
          size="large"
          variant="contained"
          onClick={HandleClosedClick}
          data-testid="tracksupervisorClosed"
        >
          {tablet.Red[fin]}
        </Button>
      </div>

      <div className={classes(css.Text)}>{tablet.HelperSecond[fin]}</div>

      <div className={classes(css.trackRowStyle)}>
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
