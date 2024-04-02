import React, { useState, useEffect } from 'react';

// Style and colors
import './Scheduling.scss';
import '../shared.module.scss';

// Date management
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Switch from '@material-ui/core/Switch';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Modal from '@material-ui/core/Modal';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { withStyles } from '@material-ui/core/styles';

import socketIOClient from 'socket.io-client';
import {
  updateRangeSupervision,
  validateLogin,
  getLanguage,
} from '../utils/Utils';
import api from '../api/api';
// Translation
import data from '../texts/texts.json';

const lang = getLanguage();
moment.locale(lang);

async function getRangeSupervisors() {
  try {
    const response = await fetch('/api/user?role=association', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.error('GETTING USER FAILED', err);
    return false;
  }
}

// A custom switch to display green color for all sliders
const CustomSwitch = withStyles({
  switchBase: {
    // grey
    color: '#cccccc',
    '&$checked': {
      // green
      color: '#658f60',
    },
    '&$checked + $track': {
      backgroundColor: '#658f60',
    },
  },
  checked: {},
  track: {},
})(Switch);

function Scheduling(props) {
  const [state, setState] = useState('loading');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Nope');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [date, setDate] = useState(new Date());
  const [rangeId, setRangeId] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [open, setOpen] = useState(new Date());
  const [close, setClose] = useState(new Date());
  const [available, setAvailable] = useState(false);
  const [rangeSupervisors, setRangeSupervisors] = useState();
  const [rangeSupervisorSwitch, setRangeSupervisorSwitch] = useState(false);
  const [rangeSupervisorId, setRangeSupervisorId] = useState('');
  const [rangeSupervisorOriginal, setRangeSupervisorOriginal] = useState('');
  const [rangeSupervisionScheduled, setRangeSupervisionScheduled] =
    useState(false);
  const [daily, setDaily] = useState(false);
  const [weekly, setWeekly] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [datePickerKey, setDatePickerKey] = useState(1);
  const [socket, setSocket] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [trackStates, setTrackStates] = useState({});
  const [events, setEvents] = useState({});
  const [callUpdate, setCallUpdate] = useState(false);

  useEffect(() => {
    setDatePickerKey(Math.random()); // force datepicker to re-render when language changed
    validateLogin().then((logInSuccess) => {
      if (!logInSuccess) {
        props.history.push('/');
      } else {
        getRangeSupervisors()
          .then((response) => {
            if (response !== false) {
              setRangeSupervisors(response);
              update();
              setState('loading');
            }
          })
          .catch((error) => {
            console.error('init failed', error);
          });
      }
    });

    setSocket(socketIOClient());
  }, []);

  // runs after date changed with datePicker
  useEffect(() => {
    if (callUpdate) {
      continueWithDate();
      setCallUpdate(false);
    }
  }, [callUpdate]);

  // if these all tracks can work with track changes only changed updates could be sent
  // there's a bug somewhere that makes state handling here a pain
  const openAllTracks = () => {
    if (tracks) {
      let ts = trackStates;
      tracks.forEach((track) => {
        ts = { ...ts, [track.id]: 'present' };
      });
      setTrackStates(ts);
    }
  };

  const emptyAllTracks = () => {
    if (tracks) {
      let ts = trackStates;
      tracks.forEach((track) => {
        ts = { ...ts, [track.id]: 'absent' };
      });
      setTrackStates(ts);
    }
  };

  const closeAllTracks = () => {
    if (tracks) {
      let ts = trackStates;
      tracks.forEach((track) => {
        ts = { ...ts, [track.id]: 'closed' };
      });
      setTrackStates(ts);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleDatePickChange = (newDate) => {
    setDate(newDate);
    setCallUpdate(true);
  };

  const continueWithDate = (event) => {
    if (
      event !== undefined &&
      event.type !== undefined &&
      event.type === 'submit'
    ) {
      event.preventDefault();
    }
    setState('loading');
    update();
  };

  const handleTimeStartChange = (date) => {
    setOpen(date);
  };

  const handleTimeEndChange = (date) => {
    setClose(date);
  };

  const handleSwitchChange = (event) => {
    //console.log("Switch",event.target.name, event.target.checked);

    if (event.target.name == 'available') setAvailable(event.target.checked);
    if (event.target.name == 'rangeSupervisorSwitch')
      setRangeSupervisorSwitch(event.target.checked);

    setEvents({ ...events, [event.target.name]: event.target.checked });
  };

  const handleRepeatChange = (event) => {
    // console.log("Repeat",event.target.id, event.target.checked)

    if (event.target.id === 'daily') {
      setDaily(!daily);
    } else if (event.target.id === 'weekly') {
      setWeekly(!weekly);
    } else if (event.target.id === 'monthly') {
      setMonthly(!monthly);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setToast(false);
  };

  const handleRadioChange = (event) => {
    //console.log("Radio",event.target.name, event.target);
    // having the name be a int causes
    // Failed prop type: Invalid prop `name` of type `number`

    setTrackStates({ ...trackStates, [event.target.name]: event.target.value });

    setEvents({ ...events, [event.target.name]: event.target.value });
  };

  const handleValueChange = (event) => {
    //console.log("Value change",event.target.name, event.target.value);

    if (event.target.name == 'rangeSupervisorId')
      setRangeSupervisorId(event.target.value);
    if (event.target.name == 'repeatCount') setRepeatCount(event.target.value);

    setEvents({ ...events, [event.target.name]: event.target.value });
  };

  const handleBackdropClick = (event) => {
    // console.log("Backdrop clicked",event);
    event.preventDefault();
  };

  const handleNotice = (event) => {
    // console.log("handle notice",event.target.id,event.target.value,this.state.tracks)
    const idx = tracks.findIndex(
      (findItem) => findItem.id === parseInt(event.target.id),
    );
    let newTracks = tracks;
    newTracks[idx].notice = event.target.value;
    setTracks(newTracks);
  };

  const saveChanges = async () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');

    setState('loading');

    // update call/error handling
    const updateSC = async (
      date,
      rsId,
      srsId,
      rangeSupervisionScheduled,
      tracks,
      isRepeat,
    ) => {
      await updateCall(
        date,
        rsId,
        srsId,
        rangeSupervisionScheduled,
        tracks,
        isRepeat,
      ).then(
        () => {
          setToast(true);
          setToastMessage(sched.Success[fin]);
          setToastSeverity('success');
        },
        (error) => {
          console.error(`Update rejection called: ${error.message}`);
          if (error.message === 'Range officer enabled but no id') {
            setToast(true);
            setToastMessage(sched.Warning[fin]);
            setToastSeverity('warning');
          } else {
            setToast(true);
            setToastMessage(sched.Error[fin]);
            setToastSeverity('error');
          }
        },
      );
    };

    // this function calls the api repeatedly
    // this approach causes lag
    // this needs to be fixed
    const repeat = async () => {
      let newDate = moment(date).format('YYYY-MM-DD');
      await updateSC(
        newDate,
        reservationId,
        scheduleId,
        rangeSupervisionScheduled,
        tracks,
        false,
      );
      if (daily || weekly || monthly) {
        for (let i = 0; i < repeatCount; i += 1) {
          if (daily) {
            newDate = moment(newDate).add(1, 'days');
          } else if (weekly) {
            newDate = moment(newDate).add(1, 'weeks');
          } else if (monthly) {
            newDate = moment(newDate).add(1, 'months');
          }

          try {
            // fetch new requirements for the next day
            const response = await api.getSchedulingDate(
              moment(newDate).format('YYYY-MM-DD'),
            );
            await updateSC(
              date,
              response.reservationId,
              response.scheduleId,
              response.rangeSupervisionScheduled,
              response.tracks,
              true,
            );
          } catch (err) {
            console.log(err);
          }
        }
      }
    };

    await repeat();
    // update here not necessarily needed but fixes
    // when saved to a new date with post and then immediately after
    // saving again without updating ids.
    update();
    setState('ready');
    socket.emit('refresh');
  };

  /*
   *   Components
   *
   *   TrackList for individual track states
   *   RangeSupervisorSelect for supervisor select box
   */

  // builds tracklist
  const createTrackList = () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');
    const items = [];
    for (const key in tracks) {
      items.push(
        <React.Fragment key={key}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{tracks[key].name}</FormLabel>
            <RadioGroup
              defaultValue="absent"
              name={tracks[key].id.toString()}
              onChange={handleRadioChange}
              value={trackStates[tracks[key].id] || 'absent'}
              data-testid={`track-${tracks[key].id.toString()}`}
            >
              <FormControlLabel
                value="present"
                control={
                  <Radio style={{ fontColor: 'black', color: '#658f60' }} />
                }
                label={sched.OfficerPresent[fin]}
              />
              <FormControlLabel
                value="absent"
                control={
                  <Radio style={{ fontColor: 'black', color: '#5f77a1' }} />
                }
                label={sched.OfficerAbsent[fin]}
              />
              <FormControlLabel
                value="closed"
                control={
                  <Radio style={{ fontColor: 'black', color: '#c97b76' }} />
                }
                label={sched.Closed[fin]}
              />
            </RadioGroup>
            <TextareaAutosize
              className="notice"
              id={tracks[key].id}
              aria-label="Ilmoitus"
              rowsMin={1}
              rowsMax={3}
              onChange={handleNotice}
              value={tracks[key].notice !== null ? tracks[key].notice : ''}
              style={{ backgroundColor: 'blackTint10' }}
            />
          </FormControl>
        </React.Fragment>,
      );
    }
    return <>{items}</>;
  };

  // builds range officer select
  const createSupervisorSelect = () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');

    let sortedSupervisors = [];
    const disabled = false;

    if (rangeSupervisors) {
      // sort supervisors in alphabetical order
      sortedSupervisors = rangeSupervisors.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    }

    return (
      <FormControl>
        <InputLabel id="chooserangeSupervisorLabel">
          {sched.Select[fin]}
        </InputLabel>
        <Select
          {...(disabled && { disabled: true })}
          labelId="chooserangeSupervisorLabel"
          name="rangeSupervisorId"
          value={rangeSupervisorId || ''}
          onChange={handleValueChange}
          data-testid="rangeSupervisorSelect"
        >
          {sortedSupervisors.map((supervisor) => (
            <MenuItem key={supervisor.id} value={supervisor.id}>
              {supervisor.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const updateCall = async (
    date,
    rsId,
    srsId,
    rangeSupervisionScheduled,
    paramTracks,
    isRepeat,
  ) => {
    /* eslint-disable-next-line */
    return new Promise(async (resolve, reject) => {
      let reservationMethod;
      let reservationPath = '';
      let scheduledRangeSupervisionMethod;
      let scheduledRangeSupervisionPath = '';

      // determine exist or not with:
      // reservationId: '',
      // scheduledRangeSupervisionId: '',
      // trackSupervisionId: '',
      console.log('rsId: ', rsId);
      if (rsId !== null) {
        reservationMethod = 'PUT';
        reservationPath = `/${rsId}`;
      } else reservationMethod = 'POST';

      console.log('srsId: ', srsId);
      if (srsId !== null) {
        scheduledRangeSupervisionMethod = 'PUT';
        scheduledRangeSupervisionPath = `/${srsId}`;
      } else scheduledRangeSupervisionMethod = 'POST';

      let params = {
        range_id: rangeId,
        available: available,
        supervisor: rangeSupervisorId,
      };

      if (reservationMethod === 'POST') {
        // reservation can result in a duplicate which causes http 500
        params = {
          ...params,
          date: moment(date).format('YYYY-MM-DD'),
        };
      }

      /* eslint-disable-next-line */
      const reservation = async (rsId, params, method, path) => {
        try {
          return await fetch(`/api/reservation${path}`, {
            method,
            body: JSON.stringify(params),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            /* eslint-disable-next-line */
            .then((res) => {
              // 400 and so on
              if (!res.ok) {
                return reject(new Error('update reservation failed'));
              }
              if (res.status !== 204) {
                return res.json();
              }
            })
            .then((json) => {
              // pretty sure the code paths could be done better
              if (typeof rsId !== 'number' && json !== undefined) {
                rsId = json.id; // eslint-disable-line
              }
              if (typeof rsId !== 'number') {
                return reject(new Error('no reservation id for schedule'));
              }
              return rsId;
            });
        } catch (error) {
          console.error('reservation', error);
          return reject(new Error('general reservation failure'));
        }
      };

      const reservationRes = await reservation(
        rsId,
        params,
        reservationMethod,
        reservationPath,
      );
      // if res grabbed from previous post
      if (reservationRes !== undefined) {
        rsId = reservationRes; // eslint-disable-line
      }

      params = {
        range_reservation_id: rsId,
        open: moment(open).format('HH:mm'),
        close: moment(close).format('HH:mm'),
        supervisor_id: null,
      };

      if (rangeSupervisorSwitch) {
        if (rangeSupervisorId !== null) {
          params = {
            ...params,
            association_id: rangeSupervisorId,
          };
        } else return reject(new Error('Range officer enabled but no id'));
      }

      /* eslint-disable-next-line */
      const schedule = async (rsId, srsId, params, method, path) => {
        try {
          return await fetch(`/api/schedule${path}`, {
            method,
            body: JSON.stringify(params),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            /* eslint-disable-next-line */
            .then((res) => {
              // 400 and so on
              if (res.ok === false) {
                return reject(new Error('update schedule failed'));
              }
              if (res.status !== 204) {
                return res.json();
              }
            })
            .then((json) => {
              if (typeof srsId !== 'number' && json !== undefined) {
                srsId = json.id; // eslint-disable-line
              }
              if (typeof srsId !== 'number') {
                return reject(
                  new Error('no schedule id for track supervision'),
                );
              }
              return srsId;
            });
        } catch (error) {
          console.error('schedule', error);
          return reject(new Error('general schedule failure'));
        }
      };

      const scheduleRes = await schedule(
        rsId,
        srsId,
        params,
        scheduledRangeSupervisionMethod,
        scheduledRangeSupervisionPath,
      );
      // if res grabbed from previous post
      if (scheduleRes !== undefined) {
        srsId = scheduleRes; // eslint-disable-line
      }

      /*
       *  Range supervision
       */

      let rangeStatus = null;

      if (!available) {
        rangeStatus = 'closed';
      } else if (!rangeSupervisorSwitch) {
        rangeStatus = 'absent';
      } else if (
        rangeSupervisorId !== null &&
        rangeSupervisorOriginal !== rangeSupervisorId
      ) {
        rangeStatus = 'not confirmed';
      }

      if (rangeStatus !== null) {
        const rangeSupervisionRes = await updateRangeSupervision(
          rsId,
          srsId,
          rangeStatus,
          rangeSupervisionScheduled,
          rangeSupervisorId,
        );
        if (rangeSupervisionRes !== true) {
          return reject(new Error(rangeSupervisionRes));
        }
      }

      /* eslint-disable-next-line */
      const trackSupervision = async (srsId, key) => {
        try {
          // update only ones changed in state
          if (trackStates[tracks[key].id] !== undefined || isRepeat) {
            const statusInState = trackStates[tracks[key].id];
            // if coming from repeat and status was cleared
            const supervisorStatus =
              statusInState !== undefined ? statusInState : 'absent';

            let { notice } = tracks[key];
            if (notice === null) {
              // undefined gets removed in object
              notice = undefined;
            }

            /* eslint-disable-next-line */
            let params = {
              track_supervisor: supervisorStatus,
              notice,
              association: rangeSupervisorId,
            };

            let srsp = '';
            let trackSupervisionMethod = '';
            // if scheduled track supervision exists -> put, otherwise -> post
            if (paramTracks[key].scheduled) {
              trackSupervisionMethod = 'PUT';
              srsp = `/${srsId}/${tracks[key].id}`;
            } else {
              trackSupervisionMethod = 'POST';
              params = {
                ...params,
                scheduled_range_supervision_id: srsId,
                track_id: tracks[key].id,
              };
            }
            return await fetch(`/api/track-supervision${srsp}`, {
              method: trackSupervisionMethod,
              body: JSON.stringify(params),
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
              /* eslint-disable-next-line */
              .then((res) => {
                // 400 and so on
                if (res.ok === false) {
                  return reject(new Error('update track supervision failed'));
                }
                if (res.status !== 204) {
                  return res.json();
                }
              });
          }
        } catch (error) {
          console.error('track supervision', error);
          return reject(new Error('general track supervision failure'));
        }
      };
      for (const key in tracks) {
        try {
          await trackSupervision(srsId, key);
        } catch (error) {
          return reject(error);
        }
      }

      return resolve('update success');
    });
  };

  const update = async () => {
    try {
      const response = await api.getSchedulingDate(date);

      setDate(moment(response.date));
      setRangeId(response.rangeId);
      setReservationId(response.reservationId);
      setScheduleId(response.scheduleId);
      setOpen(
        response.open !== null
          ? moment(response.open, 'h:mm:ss').format()
          : moment(response.date).hour(17).minute(0).second(0),
      );
      setClose(
        response.close !== null
          ? moment(response.close, 'h:mm:ss').format()
          : moment(response.date).hour(20).minute(0).second(0),
      );
      setAvailable(response.available !== null ? response.available : false);
      setRangeSupervisorSwitch(response.rangeSupervisorId !== null);
      setRangeSupervisorId(response.rangeSupervisorId);
      setRangeSupervisorOriginal(response.rangeSupervisorId);
      setRangeSupervisionScheduled(response.rangeSupervisionScheduled);
      setTracks(response.tracks);
      setState('ready');

      let ts = trackStates;

      // set current track state for scheduled
      for (const key in response.tracks) {
        // eslint-disable-line
        if (response.tracks[key].scheduled) {
          ts = {
            ...ts,
            [response.tracks[key].id]: response.tracks[key].trackSupervision,
          };
        } else {
          // clears track states between date changes
          ts = { ...ts, [response.tracks[key].id]: undefined };
        }
      }
      setTrackStates(ts);
    } catch (err) {
      console.error('getting info failed', err);
    }
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const { sched } = data;
  const fin = localStorage.getItem('language');

  return (
    <div className="schedulingRoot">
      <Modal open={state !== 'ready'} onClick={handleBackdropClick}>
        <Backdrop open={state !== 'ready'} onClick={handleBackdropClick}>
          <CircularProgress disableShrink />
        </Backdrop>
      </Modal>

      {/* Section for selecting date */}
      <div className="firstSection">
        <form onSubmit={continueWithDate}>
          {/* Datepicker */}
          <MuiPickersUtilsProvider
            utils={MomentUtils}
            locale={lang}
            key={datePickerKey}
          >
            <KeyboardDatePicker
              autoOk
              margin="normal"
              name="date"
              label={sched.Day[fin]}
              value={date}
              onChange={(newDate) => handleDateChange(newDate)}
              onAccept={(newDate) => handleDatePickChange(newDate)}
              format="DD.MM.YYYY"
              showTodayButton
              data-testid="datePicker"
            />
          </MuiPickersUtilsProvider>
          <div className="continue">
            <Button
              type="submit"
              variant="contained"
              style={{ backgroundColor: '#d1ccc2' }}
              data-testid="dateButton"
            >
              {sched.Day[fin]}
            </Button>
          </div>
        </form>
      </div>

      <hr />

      {/* Section for setting range officer status and open/close times of the tracks */}
      <div className="secondSection">
        <div className="topRow">
          <div className="text">{sched.Open[fin]}</div>

          <CustomSwitch
            checked={available}
            onChange={handleSwitchChange}
            name="available"
            data-testid="available"
          />
        </div>
        <div className="middleRow">
          <div className="roSwitch">
            <div className="text">{sched.Rangeofficer[fin]}</div>
            <CustomSwitch
              className="officerSwitch"
              checked={rangeSupervisorSwitch}
              onChange={handleSwitchChange}
              name="rangeSupervisorSwitch"
              data-testid="rangeSupervisorSwitch"
            />
          </div>
          {createSupervisorSelect()}
        </div>
        <div className="bottomRow">
          <div className="text">{sched.OpenHours[fin]}</div>
          <MuiPickersUtilsProvider utils={MomentUtils} locale="fi">
            <KeyboardTimePicker
              autoOk
              ampm={false}
              margin="normal"
              name="start"
              label={sched.Start[fin]}
              value={open}
              onChange={handleTimeStartChange}
              minutesStep={5}
              showTodayButton
            />
          </MuiPickersUtilsProvider>
          <div className="dash">-</div>
          <MuiPickersUtilsProvider utils={MomentUtils} locale="fi">
            <KeyboardTimePicker
              autoOk
              ampm={false}
              margin="normal"
              name="end"
              label={sched.Stop[fin]}
              value={close}
              onChange={handleTimeEndChange}
              minutesStep={5}
              showTodayButton
            />
          </MuiPickersUtilsProvider>
        </div>
      </div>

      <hr />

      {/* Section for setting track-specific open/close/absent statuses */}
      <div className="thirdSection">
        <div className="leftSide">{createTrackList()}</div>
        <div className="rightSide">
          <Button
            variant="contained"
            color="primary"
            onClick={openAllTracks}
            style={{ color: 'black', backgroundColor: '#658f60' }}
            data-testid="openAll"
          >
            {sched.OpenAll[fin]}
          </Button>
          <Button
            variant="contained"
            onClick={emptyAllTracks}
            style={{ backgroundColor: '#5f77a1' }}
            data-testid="emptyAll"
          >
            {sched.ClearAll[fin]}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={closeAllTracks}
            style={{ color: 'black', backgroundColor: '#c97b76' }}
            data-testid="closeAll"
          >
            {sched.CloseAll[fin]}
          </Button>
        </div>
      </div>
      <hr />
      <div className="fourthSection">
        <div className="repetition">
          <div className="daily">
            {sched.RepeatDaily[fin]}
            <CustomSwitch
              checked={daily}
              onChange={handleRepeatChange}
              id="daily"
              data-testid="dailyRepeat"
            />
          </div>
          <div className="weekly">
            {sched.RepeatWeekly[fin]}
            <CustomSwitch
              checked={weekly}
              onChange={handleRepeatChange}
              id="weekly"
              data-testid="weeklyRepeat"
            />
          </div>
          <div className="monthly">
            {sched.RepeatMonthly[fin]}
            <CustomSwitch
              checked={monthly}
              onChange={handleRepeatChange}
              id="monthly"
              data-testid="monthlyRepeat"
            />
          </div>
          <div className="repeatCount">
            {sched.Amount[fin]}
            <TextField
              name="repeatCount"
              type="number"
              value={repeatCount}
              onChange={handleValueChange}
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />
          </div>
        </div>
        <div className="save">
          <Button
            variant="contained"
            onClick={saveChanges}
            style={{ backgroundColor: '#d1ccc2' }}
          >
            {sched.Save[fin]}
          </Button>
          <div
            className="hoverHand arrow-right"
            onClick={() =>
              handleDatePickChange(
                moment(date).add(1, 'days').format('YYYY-MM-DD'),
              )
            }
          />
          <div className="toast">
            <Snackbar
              open={toast}
              autoHideDuration={5000}
              onClose={handleSnackbarClose}
            >
              <Alert onClose={handleSnackbarClose} severity={toastSeverity}>
                {toastMessage}!
              </Alert>
            </Snackbar>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scheduling;
