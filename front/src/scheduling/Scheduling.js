import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

// Style and colors
import './Scheduling.scss';
import '../shared.module.scss';

// Date management
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Switch from '@mui/material/Switch';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Modal from '@mui/material/Modal';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { withStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import colors from '../colors.module.scss';
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
  const [expand, setExpand] = useState(false);
  const [statusColor, setStatusColor] = useState();
  const [statusText, setStatusText] = useState();
  const [cookies] = useCookies(['role']);
  const [arrivalTime, setArrivalTime] = useState(new Date());

  useEffect(() => {
    let isMounted = true;

    setDatePickerKey(Math.random()); // force datepicker to re-render when language changed
    validateLogin().then((logInSuccess) => {
      if (!isMounted) return;

      if (!logInSuccess) {
        props.history.push('/');
      } else {
        getRangeSupervisors()
          .then((response) => {
            if (isMounted && response !== false) {
              setRangeSupervisors(response);
              update();
              setState('loading');
            }
          })
          .catch((error) => {
            if (isMounted) {
              console.error('init failed', error);
            }
          });
      }
    });
    // Updates the status colour and text in the UI based on the
    // data received from the socket event
    const socket = socketIOClient()
      .on('rangeUpdate', (msg) => {
        if (isMounted) {
          setStatusColor(msg.color);
          setStatusText(msg.text);
          if (rangeSupervisionScheduled === false) {
            setRangeSupervisionScheduled(true);
          }
        }
      })
      .on('refresh', () => {
        if (isMounted) {
          window.location.reload();
        }
      });

    setSocket(socket);

    // cleanup function
    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, []);

  // runs after date changed with datePicker
  useEffect(() => {
    if (callUpdate) {
      continueWithDate();
      setCallUpdate(false);
      setExpand(false);
    }
  }, [callUpdate]);

  // Opens all tracks
  const openAllTracks = () => {
    if (tracks) {
      const updatedTrackStates = {};

      // Set each track's state to present
      tracks.forEach((track) => {
        updatedTrackStates[track.id] = 'present';
      });

      // Update the trackStates
      setTrackStates((prevStates) => ({
        ...prevStates, ...updatedTrackStates,
      }));
    }
  };

  // Closes all tracks
  const closeAllTracks = () => {
    if (tracks) {
      const updatedTrackStates = {};

      // Set each track's state to closed
      tracks.forEach((track) => {
        updatedTrackStates[track.id] = 'closed';
      });

      // Update the trackStates
      setTrackStates((prevStates) => ({
        ...prevStates, ...updatedTrackStates,
      }));
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

    if (event.target.name === 'available' && !available) {
      setAvailable(event.target.checked);
    }
    // If center is closed also the shooting tracks will be closed
    if (event.target.name === 'available' && available) {
      setAvailable(event.target.checked);
      closeAllTracks();
    }
    
    if (event.target.name === 'rangeSupervisorSwitch') {
      setRangeSupervisorSwitch(event.target.checked);
    }

    setExpand(false);

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
  // Handles the toggle switches for the tracks 
  // and updates the track states and events
  const handleTrackSwitchChange = (event) => {
    //console.log("Radio",event.target.name, event.target);
    // having the name be a int causes
    // Failed prop type: Invalid prop `name` of type `number`

    const { name, checked } = event.target;

    setTrackStates((prevStates) => ({
      ...prevStates, [name]: checked ? 'present' : 'closed',
    }));

    setEvents((prevEvents) => ({
      ...prevEvents,
      [name]: checked ? 'present' : 'closed',
    }));
  };

  const handleValueChange = (event) => {
    //console.log("Value change",event.target.name, event.target.value);

    if (event.target.name === 'rangeSupervisorId')
      setRangeSupervisorId(event.target.value);
    if (event.target.name === 'repeatCount') setRepeatCount(event.target.value);

    setEvents({ ...events, [event.target.name]: event.target.value });
  };

  const handleBackdropClick = (event) => {
    // console.log("Backdrop clicked",event);
    event.preventDefault();
  };

  const handleNotice = (event) => {
    // console.log("handle notice",event.target.id,event.target.value,this.state.tracks)
    const maxLength = 255;
    const value = event.target.value.slice(0, maxLength); // limit to 255 characters
    const idx = tracks.findIndex(
      (findItem) => findItem.id === parseInt(event.target.id),
    );
    let newTracks = [...tracks];
    newTracks[idx] = { ...newTracks[idx], notice: value };
    setTracks(newTracks);
  };

  // Handles the expansion of the status bar
  const handleExpandClick = () => {
    setExpand(!expand);
  };

  // Emits a 'rangeUpdate' event with the status 'not confirmed'
  // and updates the supervisor's status in the UI
  const handleNotConfirmed = () => {
    socket.emit('rangeUpdate', {
      status: 'not confirmed',
      color: colors.turquoise,
      text: sched.SuperBlue[fin],
    });
    updateSupervisor('not confirmed', colors.turquoise, sched.SuperBlue[fin]);
  };

  // Emits a 'rangeUpdate' event with the status 'confirmed'
  // and updates the supervisor's status in the UI
  const handleConfirmed = () => {
    socket.emit('rangeUpdate', {
      status: 'confirmed',
      color: colors.greenLight,
      text: sched.SuperLightGreen[fin],
    });
    updateSupervisor('confirmed', colors.greenLight, sched.SuperLightGreen[fin]);
  };  

  // Emits a 'rangeUpdate' event with the status 'en route'
  // and updates the supervisor's status in the UI
  const handleEnRouteClick = () => {
    socket.emit('rangeUpdate', {
      status: 'en route',
      color: colors.orange,
      text: sched.SuperOrange[fin],
    });
    updateSupervisor('en route', colors.orange, sched.SuperOrange[fin]);
  };

  // Emits a 'rangeUpdate' event with the status 'present'
  // and updates the supervisor's status in the UI
  const handlePresentClick = () => {
    socket.emit('rangeUpdate', {
      status: 'present',
      color: colors.green,
      text: sched.SuperGreen[fin],
    });
    updateSupervisor('present', colors.green, sched.SuperGreen[fin]);
  };

  // Parses and formats the time user entered and set it as arrival time
  const handleArrivalTime = (event) => {
    const parsedTime = moment(event.target.value, 'HH:mm:ss', true);
    setArrivalTime(parsedTime.format('HH:mm:ss'));
  };

  // Confirms the set arrival time when confirm time button is clicked
  const confirmArrivalTime = async () => {
    const rangeStatus = determineRangeStatus();

    // Updates information of the range supervision if the arrival time is valid 
    if (arrivalTime) {
      try {
        await updateRangeSupervision(
          reservationId,
          scheduleId,
          rangeStatus,
          rangeSupervisionScheduled,
          rangeSupervisorId,
          arrivalTime,
        )
        // If the arrival time is successfully updated, set a success message
        setToastMessage(sched.SuccessfulUpdate[fin]);
        setToastSeverity('success');
        setToast(true);
        } // If there is an error, set an error message
          catch(error) {
            setToastMessage(sched.FailedUpdate[fin]);
            setToastSeverity('error');
            setToast(true);
        }
    } 
  };

  const saveChanges = async () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');

    setExpand(false);
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

  // Determines current range status and returns it
  const determineRangeStatus = () => {
    let rangeStatus = null;

      if (!available) {
        rangeStatus = 'closed';
      } else if (!rangeSupervisorSwitch) {
        rangeStatus = 'absent';
      } else if (statusColor === colors.turquoise) {
        rangeStatus = 'not confirmed';
      } else if (statusColor === colors.orange) {
        rangeStatus = 'en route';
      } else if (statusColor === colors.greenLight) {
        rangeStatus = 'confirmed';
      }
      return rangeStatus;
  };

  // Updates the status of range supervisor's status on the backend
  // and updates the UI with the new status
  async function updateSupervisor(status, color, text) {
    const res = await updateRangeSupervision(
      reservationId,
      scheduleId,
      status,
      rangeSupervisionScheduled,
    );

    if (res === true) {
      setStatusColor(color);
      setStatusText(text);

      if (rangeSupervisionScheduled === false) {
        setRangeSupervisionScheduled(true);
      }
    }
  };

  // creates status message for coloured status bar
  const createStatusMessage = () => {
    if (!arrivalTime || arrivalTime === 'Invalid date' || statusColor === colors.green) {
      return;
    } else {
      return ` (ETA ${arrivalTime})`;
    }
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
        <React.Fragment key = {key}>
          <Box className={`trackBox ${trackStates[tracks[key].id] === 'present' ? 'track-open' : 'track-closed'}`}>
            <FormControl component="fieldset" style={{padding:'5px'}}>
              <FormLabel component="legend">{tracks[key].name}</FormLabel>
              <div className="trackSwitchRow">
                <div>{sched.TrackOpen[fin]}</div>
                <CustomSwitch
                  disabled={!available}
                  checked = {trackStates[tracks[key].id] === 'present'}
                  onChange = {handleTrackSwitchChange}
                  name = {tracks[key].id.toString()}
                  data-testid={`track-${tracks[key].id.toString()}`}
                />
              </div>
              <TextareaAutosize
                disabled={!available}
                className="notice"
                id={tracks[key].id}
                aria-label="Ilmoitus"
                minRows={1}
                maxRows={3}
                onChange={handleNotice}
                value={tracks[key].notice !== null ? tracks[key].notice : ''}
                placeholder={sched.Notice[fin]}
                style={{ backgroundColor: 'blackTint10' }}
                maxLength={255}
              />
            </FormControl>
          </Box>
        </React.Fragment>,
      );
    }
    return <>{items}</>;
  };

  // builds range officer select
  const createSupervisorSelect = () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');

    const items = [];
    let sortedSupervisors;
    let disabled = false;
    
    if(rangeSupervisors){
      // sort supervisors in alphabetical order
       sortedSupervisors = rangeSupervisors.sort((a,b) => {
        return a.name.localeCompare(b.name);
      });
    }

    if(rangeSupervisors){
      sortedSupervisors.forEach((supervisor) => {
        items.push(
          <MenuItem key={supervisor.id} value={supervisor.id}>
            {supervisor.name}
          </MenuItem>,
        );
      });
    }

    if (rangeSupervisorSwitch === false) {
      disabled = true;
    }

    return (
      <FormControl>
        <InputLabel id="chooserangeSupervisorLabel">
          {sched.Select[fin]}
        </InputLabel>
        <Select
          disabled={!available}
          {...(disabled && { disabled: true })}
          labelId="chooserangeSupervisorLabel"
          label={sched.Select[fin]}
          name="rangeSupervisorId"
          value={rangeSupervisorId || ''}
          onChange={handleValueChange}
          data-testid="rangeSupervisorSelect"
        >
          {items}
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
        originalSupervisor: rangeSupervisorOriginal,
        scheduleId: srsId
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
          arrivalTime
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
                scheduled_range_supervision_id: srsId && srsId.id ? srsId: srsId,
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
      setArrivalTime(response.arrivingAt);

      if (response.rangeSupervision === 'present') {
        setStatusText(sched.SuperGreen[fin]);
        setStatusColor(colors.green);
      } else if (response.rangeSupervision === 'en route') {
        setStatusText(sched.SuperOrange[fin]);
        setStatusColor(colors.orange);
      } else if (response.rangeSupervision === 'absent') {
        setStatusText(sched.SuperWhite[fin]);
        setStatusColor(colors.white);
      } else if (response.rangeSupervision === 'closed') {
        setStatusText(sched.Red[fin]);
        setStatusColor(colors.redLight);
      } else if (response.rangeSupervision === 'confirmed') {
        setStatusText(sched.SuperLightGreen[fin]);
        setStatusColor(colors.greenLight);
      } else if (response.rangeSupervision === 'not confirmed') {
        setStatusText(sched.SuperBlue[fin]);
        setStatusColor(colors.turquoise);
      } else {
        setStatusText(sched.SuperWhite[fin]);
        setStatusColor(colors.white);
      }

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

      <h1 className ="heading">{sched.Schedule[fin]}</h1>

      {/* Section for selecting date, setting range officer status, and open/close times of the tracks*/}
      <Box className="firstSection">
        <form onSubmit={continueWithDate}>
          {/* Datepicker */}
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={lang} key={datePickerKey}>
            <DatePicker
              closeOnSelect
              label={sched.Day[fin]}
              value={moment(date)}
              onChange={(newDate) => handleDateChange(newDate)}
              onAccept={(newDate) => handleDatePickChange(newDate)}
              format="DD.MM.YYYY"               
              slots={{textField: TextField}}
              showTodayButton
              data-testid="datePicker"
            />
          </LocalizationProvider>
        </form>
        <FormControl component="fieldset" style={{padding:'5px'}}>
          <div className="options">
            <div className="topRow">
            <div className="text">{sched.Open[fin]}</div>

            <CustomSwitch
              checked={available}
              onChange={handleSwitchChange}
              name="available"
              data-testid="available"
            /> 
            </div>
            <hr />
            <div className="middleRow">
              <div className="text">{sched.OpenHours[fin]}</div>
              <div className='timePicker'>
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fi">
                  <TimePicker
                    disabled={!available}
                    closeOnSelect
                    ampm={false}
                    label={sched.Start[fin]}
                    value={moment(open)}
                    onChange={handleTimeStartChange}
                    minutesStep={5}
                    slots={{textField: TextField}}
                    showTodayButton
                  />
                </LocalizationProvider>
                <div className="dash">-</div>
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fi">
                  <TimePicker
                    disabled={!available}
                    closeOnSelect
                    ampm={false}
                    label={sched.Stop[fin]}
                    value={moment(close)}
                    onChange={handleTimeEndChange}
                    minutesStep={5}
                    slots={{textField: TextField}}
                    showTodayButton
                  />
                </LocalizationProvider>
              </div>
            </div>
            <hr />
            <div className="bottomRow">
                <div className="text">{sched.Rangeofficer[fin]}</div>
                <CustomSwitch
                  disabled={!available}
                  checked={rangeSupervisorSwitch}
                  onChange={handleSwitchChange}
                  name="rangeSupervisorSwitch"
                  data-testid="rangeSupervisorSwitch"
                />
            </div> 
            {rangeSupervisorSwitch && (
              <div className='selectOfficer'>{createSupervisorSelect()}</div>
            )}  
          </div>
          </FormControl>
          <FormControl component="fieldset" style={{padding:'5px'}}>
            <div className="rangeOfficerStatus" style={{backgroundColor: `${statusColor}`}}>
                <div className="statusText">
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem'}}>{statusText}</span>{createStatusMessage()}
                </div>
                  {cookies.role === 'superuser' && (
                    <div className="expandMore">
                      <span className="edit">{sched.Edit[fin]}</span>
                      <Button
                        disabled={!available || !rangeSupervisorSwitch || !rangeSupervisorId}
                        className="expandMoreButton"
                        onClick={handleExpandClick}
                        aria-expanded={expand}
                        aria-label={expand ? "Collapse options" : "Expand options"}
                      >
                        {!expand ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                      </Button>
                    </div>
                  )}
                </div>
            {expand && (
              <Box>
                <div className="dropDownContent">
                  <div className="helperText"><p>{sched.Helper[fin]}</p></div>
                  <div className="statusButtons">
                    <Button
                      className="notConfirmed"
                      variant="contained"
                      style={{ backgroundColor: colors.turquoise }}
                      onClick={handleNotConfirmed}>
                      {sched.Blue[fin]}
                    </Button>
                    <Button
                      className="confirmed"
                      variant="contained"
                      style={{ backgroundColor: colors.greenLight }}
                      onClick={handleConfirmed}>
                      {sched.LightGreen[fin]}
                    </Button>
                    <Button
                      className="onTheWay"
                      variant="contained"
                      style={{ backgroundColor: colors.orange }}
                      onClick={handleEnRouteClick}>
                      {sched.Orange[fin]}
                    </Button>
                    <Button
                      className="present"
                      variant="contained"
                      style={{ backgroundColor: colors.green }}
                      onClick={handlePresentClick}>
                      {sched.Green[fin]}
                    </Button>
                  </div>
                  <hr />
                  <div className="eta">
                    <p>{sched.AddETA[fin]}:</p>
                    <TextField
                      disabled={statusColor === colors.green}
                      id="time"
                      type="time"
                      defaultValue={arrivalTime ? arrivalTime : "00:00:00"}
                      onChange={(event) => handleArrivalTime(event)} 
                      style={{minWidth:'112px'}}
                    />
                    <Button
                      disabled={statusColor === colors.green}
                      className="confirmTimeButton"
                      variant="contained"
                      onClick={confirmArrivalTime}
                    >{sched.ConfirmTime[fin]}
                    </Button>
                  </div>
                </div>
              </Box>
            )}
          </FormControl>
      </Box>

      {/* Section for setting track-specific open/close statuses */}
      <Box className="secondSection">
        <div><h3 className="headingTracks">{sched.ManageTracks[fin]}</h3></div>
        <div className="tracks">{createTrackList()}</div>
        <div className="buttons">
          <Button
            disabled={!available}
            className="openAll"
            variant="contained"
            color="primary"
            onClick={openAllTracks}
            style={{ color: 'black', backgroundColor: '#7DA578'}}
            data-testid="openAll"
          >
            {sched.OpenAll[fin]}
          </Button>
          
          <Button
            disabled={!available}
            className="closeAll"
            variant="contained"
            color="secondary"
            onClick={closeAllTracks}
            style={{ color: 'black', backgroundColor: '#c97b76' }}
            data-testid="closeAll"
          >
            {sched.CloseAll[fin]}
          </Button>
        </div>
      </Box>

      {/* Section for Advanced options */}
      <Box className="thirdSection">
        <div><h3 className="headingAdvanced">{sched.AdvancedOptions[fin]}</h3></div>
        <FormControl component="fieldset" style={{padding:'5px'}}>
          <Box className="repeat">
            <div className="daily">
              {sched.RepeatDaily[fin]}
              <CustomSwitch
                disabled={!available}
                checked={daily}
                onChange={handleRepeatChange}
                id="daily"
                data-testid="dailyRepeat"
              />
            </div>
            <hr />
            <div className="weekly">
              {sched.RepeatWeekly[fin]}
              <CustomSwitch
                disabled={!available}
                checked={weekly}
                onChange={handleRepeatChange}
                id="weekly"
                data-testid="weeklyRepeat"
              />
            </div>
            <hr />
            <div className="monthly">
              {sched.RepeatMonthly[fin]}
              <CustomSwitch
                disabled={!available}
                checked={monthly}
                onChange={handleRepeatChange}
                id="monthly"
                data-testid="monthlyRepeat"
              />
            </div>
          </Box>
            <Box className="repeatCount">
              {sched.Amount[fin]}
              <TextField
                disabled={!available}
                name="repeatCount"
                type="number"
                value={repeatCount}
                onChange={handleValueChange}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </Box>
        </FormControl>
      </Box>

      <div className="save">
          <Button
            variant="contained"
            onClick={saveChanges}
            style={{ backgroundColor: '#d1ccc2' }}
          >
            {sched.Save[fin]}
          </Button>
      
          <div className="toast">
            <Snackbar
              open={toast}
              autoHideDuration={5000}
              onClose={handleSnackbarClose}
            >
              <div>
                <Alert onClose={handleSnackbarClose} severity={toastSeverity}>
                  {toastMessage}!
                </Alert>
              </div>
            </Snackbar>
          </div>
        </div>
    </div>
  );
}
export default Scheduling;
