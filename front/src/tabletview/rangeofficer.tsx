import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

// Material UI components
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

// Date handling
import moment from 'moment';

// Axios for backend calls
import axios from 'axios';

// Login validation
import socketIOClient from 'socket.io-client';
import { validateLogin, updateRangeSupervision } from '../utils/Utils';

// Submitting track usage statistics
import { TrackStatistics } from '../TrackStatistics/TrackStatistics';

// Receiving possible info messages
import InfoBox from '../infoBox/InfoBox';
import Devices from '../Devices/devices';

import classNames from 'classnames';
import colors from '../colors.module.scss';
import css from './rangeofficer.module.scss';

const classes = classNames.bind(css);

// shooting track rows
const TrackRows = ({ tracks, setTracks, scheduleId, socket, disabled }) =>
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
          socket={socket}
          disabled={disabled}
        />
      </div>
    </div>
  ));

const TrackButtons = ({ track, scheduleId, socket, disabled }) => {
  const [buttonColor, setButtonColor] = useState(track.color);

  const supervisorState = track.scheduled ? track.scheduled.track_supervisor : 'absent';
  let supervisorStateTablet;
  if (supervisorState === 'present') supervisorStateTablet = t`Present`;
  else if (supervisorState === 'closed') supervisorStateTablet = t`Closed`;
  else supervisorStateTablet = t`No track officer`;

  const [textState, setTextState] = useState(supervisorStateTablet,);
  const [supervision, setSupervision] = useState(supervisorState);

  socket.on('trackUpdate', (msg) => {
    if (msg.id === track.id) {
      if (msg.super === 'present') {
        track.trackSupervision = 'absent'; // eslint-disable-line
        setButtonColor(colors.green);
        setTextState(t`Present`);
        setSupervision('absent');
      } else if (msg.super === 'closed') {
        track.trackSupervision = 'present'; // eslint-disable-line
        setButtonColor(colors.redLight);
        setTextState(t`Closed`);
        setSupervision('present');
      } else if (msg.super === 'absent') {
        track.trackSupervision = 'closed'; // eslint-disable-line
        setButtonColor(colors.white);
        setTextState(t`No track officer`);
        setSupervision('closed');
      }
    }
  });
  const HandleClick = () => {
    // Set "No track officer" by default
    let newSupervision = 'absent';
    setSupervision('absent');
    track.color = colors.white; // eslint-disable-line
    setTextState(t`No track officer`);

    // If track supervision is present, when clicked, set it to closed
    if (track.trackSupervision === 'present') {
      newSupervision = 'closed';
      setSupervision('closed');
      track.color = colors.redLight; // eslint-disable-line
      setTextState(t`Closed`);
    }
    // If track supervision is closed, when clicked, set it to absent
    else if (track.trackSupervision === 'absent') {
      newSupervision = 'present';
      setSupervision('present');
      track.color = colors.green; // eslint-disable-line
      setTextState(t`Present`);
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
        className={classes(css.buttonStyle)}
        style={{ backgroundColor: buttonColor }}
        size="large"
        variant="contained"
        onClick={HandleClick}
        data-testid="trackSupervisorButton"
        disabled={disabled}
      >
        {textState}
      </Button>
      <TrackStatistics track={track} supervision={supervision} disabled={disabled} />
    </div>
  );
};

async function getColors(tracks, setTracks) {
  const copy = [...tracks];

  for (let i = 0; i < copy.length; i += 1) {
    const obj = copy[i];
    if (obj.trackSupervision === 'present') {
      obj.color = colors.green;
    } else if (obj.trackSupervision === 'closed') {
      obj.color = colors.redLight;
    } else if (obj.trackSupervision === 'absent') {
      obj.color = colors.white;
    } else if (obj.trackSupervision === 'en route') {
      obj.color = colors.orange;
    }
  }
  setTracks(copy);
}

async function getData(
  setHours,
  tracks,
  setTracks,
  setStatusText,
  setStatusColor,
  setScheduleId,
  setReservationId,
  setRangeSupervisionScheduled
) {
  const date = moment(Date.now()).format('YYYY-MM-DD');

  return await fetch(`/api/datesupreme/${date}`)
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
        setStatusText(t`Range officer present`);
        setStatusColor(colors.green);
      } else if (response.rangeSupervision === 'en route') {
        setStatusText(t`Range officer on the way`);
        setStatusColor(colors.orange);
      } else if (response.rangeSupervision === 'absent') {
        setStatusText(t`Range officer undefined`);
        setStatusColor(colors.white);
      } else if (response.rangeSupervision === 'closed') {
        setStatusText(t`Closed`);
        setStatusColor(colors.redLight);
      } else if (response.rangeSupervision === 'confirmed') {
        setStatusText(t`Range officer confirmed`);
        setStatusColor(colors.greenLight);
      } else if (response.rangeSupervision === 'not confirmed') {
        setStatusText(t`Range officer predefined`);
        setStatusColor(colors.turquoise);
      } else {
        setStatusText(t`Range officer undefined`);
        setStatusColor(colors.white);
      }
      getColors(response.tracks, setTracks);
      return response.rangeSupervision;
    })
    .catch((error) => {
      console.log("Error in fetching data for tablet view: ", error);
      return null;
    });
}

const TimePick = ({ scheduleId, hours, setHours, dialogOpen, setDialogOpen }) => {
  const [errorMessage, setErrorMessage] = useState();
  const [startTime, setStartTime] = useState(new Date(0, 0, 0, hours.start?.split(':')[0] || 0, hours.start?.split(':')[1] || 0, 0));
  const [endTime, setEndTime] = useState(new Date(0, 0, 0, hours.end?.split(':')[0] || 0, hours.end?.split(':')[1] || 0, 0));

  async function handleTimeChange() {
    if (startTime === null || endTime === null) {
      setErrorMessage(t`"Invalid time selected.`);
      return;
    }
    const start = startTime.toTimeString().split(' ')[0].slice(0, 5);
    const end = endTime.toTimeString().split(' ')[0].slice(0, 5);
    const query = `/api/schedule/${scheduleId}`;
    await axios.put(query, { open: start, close: end })
      .then((res) => {
        if (res) {
          setHours({ start, end });
          setDialogOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(t`Something went wrong`);
      });
  }

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>{t`Set opening hours`}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <TimePicker
            closeOnSelect
            ampm={false}
            label={t`Start`}
            value={moment(startTime)}
            onChange={(time) => setStartTime(time.toDate())}
            minutesStep={5}
            renderInput={(params) => <TextField {...params} />}
            showTodayButton
          />
          <TimePicker
            closeOnSelect
            ampm={false}
            label={t`End`}
            value={moment(endTime)}
            onChange={(time) => setEndTime(time.toDate())}
            minutesStep={5}
            renderInput={(params) => <TextField {...params} />}
            showTodayButton
          />
        </LocalizationProvider>
        {errorMessage ? <Typography color="error">{errorMessage}</Typography> : ''}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)} className={classes(css.cancelButtonStyle)}>
          {t`Cancel`}
        </Button>
        <Button onClick={handleTimeChange} className={classes(css.saveButtonStyle)}>
          {t`Save`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const Tabletview = () => {
  const [statusColor, setStatusColor] = useState();
  const [statusText, setStatusText] = useState();
  const [hours, setHours] = useState({ start: '00:00', end: '00:00' });
  const [tracks, setTracks] = useState([]);
  const [scheduleId, setScheduleId] = useState();
  const [reservationId, setReservationId] = useState();
  const [rangeSupervisionScheduled, setRangeSupervisionScheduled] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [socket, setSocket] = useState();
  const [cookies] = useCookies(['username']);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });

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
      if (logInSuccess && (cookies.role === 'rangemaster' || cookies.role === 'superuser')) {
        getData(
          setHours,
          tracks,
          setTracks,
          setStatusText,
          setStatusColor,
          setScheduleId,
          setReservationId,
          setRangeSupervisionScheduled
        )
        .then((rangeSupervision) => {
          // Disable buttons if center is closed or no supervisor is set
          if (rangeSupervision === 'closed' || rangeSupervision === 'absent') {
            setButtonsDisabled(true);
          }
        });
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
    // If no range supervisor is set, show error message
    if (rangeSupervisionScheduled === false) {
      setNotification({ open: true, message: t`Range supervisor is not set!`, type: 'error' });
      return;
    }
    socket.emit('rangeUpdate', {
      status: 'present',
      color: colors.green,
      text: t`Range officer present`,
    });
    updateSupervisor('present', colors.green, t`Range officer present`);
    // Enable track buttons
    setButtonsDisabled(false);
  };

  const HandleEnRouteClick = () => {
    // If no range supervisor is set, show error message
    if (rangeSupervisionScheduled === false) {
      setNotification({ open: true, message: t`Range supervisor is not set!`, type: 'error' });
      return;
    }
    socket.emit('rangeUpdate', {
      status: 'en route',
      color: colors.orange,
      text: t`Range officer on the way`,
    });
    updateSupervisor('en route', colors.orange, t`Range officer on the way`);
    // Enable track buttons
    setButtonsDisabled(false);
  };

  const HandleClosedClick = () => {
    socket.emit('rangeUpdate', {
      status: 'closed',
      color: colors.redLight,
      text: t`Closed`,
    });
    updateSupervisor('closed', colors.redLight, t`Closed`);
    // Disable track buttons since no supervisor is present
    setButtonsDisabled(true);
  };



  return (
    <div>
      <InfoBox tabletMode={true} />
      <div className={classes(css.Text)}>{today}</div>


      <Typography variant="h5" align="center">
        {t`Open`}: &nbsp;
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
          scheduleId={scheduleId}
          hours={hours}
          setHours={setHours}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}

        />
      ) : (
        ''
      )}

      <div className={classes(css.rowStyle)}>

        <Button
          className={classes(css.statusStyle)}
          style={{ color: colors.black, backgroundColor: statusColor }}
          size="large"
          variant="outlined"
          disabled
          dataid="rangeOfficerStatus"
        >
          {statusText}
        </Button>
      </div>

      <div className={classes(css.Text)}>
        {t`Define range officer status by choosing color`}
      </div>

      <div className={classes(css.rowStyle)}>
        <Button
          className={classes(css.greenButtonStyle)}
          size="large"
          variant="contained"
          onClick={HandlePresentClick}
          data-testid="tracksupervisorPresent"
        >
          {t`Present`}
        </Button>
        <Button
          className={classes(css.orangeButtonStyle)}
          size="large"
          variant="contained"
          onClick={HandleEnRouteClick}
          data-testid="tracksupervisorOnWay"
        >
          {t`On the way`}
        </Button>
        <Button
          className={classes(css.redButtonStyle)}
          size="large"
          variant="contained"
          onClick={HandleClosedClick}
          data-testid="tracksupervisorClosed"
        >
          {t`Closed`}
        </Button>
      </div>


      <div className={classes(css.Text)}>
        {t`Change track officer status by choosing color. Change number of track users with buttons`}
      </div>

      <div className={classes(css.trackRowStyle)}>

        <TrackRows
          tracks={tracks}
          setTracks={setTracks}
          scheduleId={scheduleId}
          socket={socket}
          disabled={buttonsDisabled}
        />

      </div>
      { }
      <Devices />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setNotification({ ...notification, open: false })}
        severity={notification.type}>
          {notification.message}
        </MuiAlert>
      </Snackbar>

    </div>
  );
};

export default Tabletview;
