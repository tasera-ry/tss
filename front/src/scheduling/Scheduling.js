import React, { Component } from 'react';

import '../App.css';
import './Scheduling.css';

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
import socketIOClient from 'socket.io-client';
import { getSchedulingDate, rangeSupervision, validateLogin } from '../utils/Utils';

// Translation
import data from '../texts/texts.json';

let lang = 'fi'; // fallback
if (localStorage.getItem('language') === '0') {
  lang = 'fi';
} else if (localStorage.getItem('language') === '1') {
  lang = 'en';
}
moment.locale(lang);

async function getRangeSupervisors(token) {
  try {
    const response = await fetch('/api/user?role=supervisor', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (err) {
    console.error('GETTING USER FAILED', err);
    return false;
  }
}

class Scheduling extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'loading', // loading, ready
      toast: false,
      toastMessage: 'Nope',
      toastSeverity: 'success',
      date: new Date(),
      rangeId: '',
      reservationId: '',
      scheduleId: '',
      open: new Date(),
      close: new Date(),
      available: false,
      rangeSupervisorSwitch: false,
      rangeSupervisorId: '',
      rangeSupervisorOriginal: '',
      rangeSupervisionScheduled: false,
      daily: false,
      weekly: false,
      monthly: false,
      repeatCount: 1,
      token: 'SECRET-TOKEN',
      datePickerKey: 1,
    };
  }

  componentDidMount() {
    // console.log("MOUNTED",localStorage.getItem('token'));
    this.setState({
      token: localStorage.getItem('token'),
      datePickerKey: Math.random(), // force datepicker to re-render when language changed
    }, function () {
      validateLogin()
        .then((logInSuccess) => {
          if (!logInSuccess) {
            this.props.history.push('/');
          } else {
            getRangeSupervisors(this.state.token)
              .then((response) => {
                if (response !== false) {
                  this.setState({
                    rangeSupervisors: response,
                  });
                  this.update();
                  this.setState({
                    state: 'loading',
                  });
                }
              })
              .catch((error) => {
                console.error('init failed', error);
              });
          }
        });
    });
    this.socket = socketIOClient();
  }

  // if these all tracks can work with track changes only changed updates could be sent
  // there's a bug somewhere that makes state handling here a pain
  openAllTracks = () => {
    // console.log("Open tracks");
    if (this.state.tracks) {
      this.state.tracks.forEach((track) => {
        this.setState({
          [track.id]: 'present',
        });
      });
    }
  }

  emptyAllTracks = () => {
    if (this.state.tracks) {
      // console.log("Empty tracks");
      this.state.tracks.forEach((track) => {
        this.setState({
          [track.id]: 'absent',
        });
      });
    }
  };

  closeAllTracks = () => {
    // console.log("Close tracks");
    if (this.state.tracks) {
      this.state.tracks.forEach((track) => {
        this.setState({
          [track.id]: 'closed',
        });
      });
    }
  };

  handleDateChange = (date) => {
    this.setState({
      date,
    });
  };

  handleDatePickChange = (date) => {
    this.setState({
      date,
    },
    function () {
      this.continueWithDate();
    });
  };

  continueWithDate = (event) => {
    if (event !== undefined && event.type !== undefined && event.type === 'submit') {
      event.preventDefault();
    }
    this.setState({
      state: 'loading',
    },
    function () {
      // console.log("TIME IS",this.state.date);
      this.update();
    });
  }

  handleTimeStartChange = (date) => {
    this.setState({
      open: date,
    });
  };

  handleTimeEndChange = (date) => {
    this.setState({
      close: date,
    });
  };

  handleSwitchChange = (event) => {
    // console.log("Switch",event.target.name, event.target.checked)
    this.setState({
      [event.target.name]: event.target.checked,
    });
  };

  handleRepeatChange = (event) => {
    // console.log("Repeat",event.target.id, event.target.checked)

    let daily = false;
    let weekly = false;
    let monthly = false;

    if (event.target.id === 'daily') {
      daily = !this.state.daily;
    } else if (event.target.id === 'weekly') {
      weekly = !this.state.weekly;
    } else if (event.target.id === 'monthly') {
      monthly = !this.state.monthly;
    }

    this.setState({
      daily,
      weekly,
      monthly,
    });
  };

  handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
      toast: false,
    });
  };

  handleRadioChange = (event) => {
    // console.log("Radio",event.target.name, event.target)
    // having the name be a int causes
    // Failed prop type: Invalid prop `name` of type `number`
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleValueChange = (event) => {
    // console.log("Value change",event.target.name, event.target.value)
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleBackdropClick = (event) => {
    // console.log("Backdrop clicked",event);
    event.preventDefault();
  };

  handleNotice = (event) => {
    // console.log("handle notice",event.target.id,event.target.value,this.state.tracks)
    const idx = this.state.tracks.findIndex(
      (findItem) => findItem.id === parseInt(event.target.id),
    );
    const { tracks } = this.state;
    tracks[idx].notice = event.target.value;

    this.setState({
      tracks,
    }, function () {
      console.debug(this.state);
    });
  }

  saveChanges = async () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');

    this.setState({
      state: 'loading',
    });

    // update call/error handling
    const update = async (date, rsId, srsId, rangeSupervisionScheduled, tracks, isRepeat) => {
      await this.updateCall(date, rsId, srsId, rangeSupervisionScheduled, tracks, isRepeat)
        .then(() => {
          this.setState({
            toast: true,
            toastMessage: sched.Success[fin],
            toastSeverity: 'success',
          });
        },
        (error) => {
          console.error(`Update rejection called: ${error.message}`);
          if (error.message === 'Range officer enabled but no id') {
            this.setState({
              toastMessage: sched.Warning[fin],
              toastSeverity: 'warning',
              toast: true,
            });
          } else {
            this.setState({
              toastMessage: sched.Error[fin],
              toastSeverity: 'error',
              toast: true,
            });
          }
        });
    };

    // this function calls the api repeatedly
    // this approach causes lag
    // this needs to be fixed
    const repeat = async () => {
      let date = moment(this.state.date).format('YYYY-MM-DD');
      await update(
        date,
        this.state.reservationId,
        this.state.scheduleId,
        this.state.rangeSupervisionScheduled,
        this.state.tracks,
        false,
      );
      if (this.state.daily
         || this.state.weekly
         || this.state.monthly
      ) {
        for (let i = 0; i < this.state.repeatCount; i += 1) {
          if (this.state.daily) {
            date = moment(date).add(1, 'days');
          } else if (this.state.weekly) {
            date = moment(date).add(1, 'weeks');
          } else if (this.state.monthly) {
            date = moment(date).add(1, 'months');
          }

          const response = await this.updateRequirements(moment(date).format('YYYY-MM-DD'));
          await update(
            date,
            response.reservationId,
            response.scheduleId,
            response.rangeSupervisionScheduled,
            response.tracks,
            true,
          );
        }
      }
    };

    await repeat();
    // update here not necessarily needed but fixes
    // when saved to a new date with post and then immediately after
    // saving again without updating ids.
    this.update();
    this.setState({
      state: 'ready',
    });
    this.socket.emit('refresh');
  };

  // fetch new requirements for the next day
  updateRequirements = async (date) => {
    // console.log("UPDATE REQUIREMENTS",date);
    const request = async (date) => { // eslint-disable-line
      const response = await getSchedulingDate(date);

      if (response !== false) {
        // console.log("During update base results from api",response);
      } else console.error('Getting base info failed');
      return response;
    };
    return await request(date); // eslint-disable-line
  }

  /*
  * requires:
  * date,
  * reservationId,
  * scheduleId,
  *
  * from state:
  * this.state.rangeId
  * this.state.token
  * this.state.rangeSupervisorSwitch
  * this.state.open
  * this.state.close
  * this.state.rangeSupervisorId
  * this.state.tracks
  * supervisorStatus = this.state[this.state.tracks[key].id]
  */

  /*
  *   Components
  *
  *   TrackList for individual track states
  *   RangeSupervisorSelect for supervisor select box
  */

  // builds tracklist
  createTrackList = () => {
    const { sched } = data;
    const fin = localStorage.getItem('language');
    const items = [];
    const { tracks } = this.state;
    for (var key in tracks) { // eslint-disable-line
      items.push(
        <React.Fragment
          key={key}
        >
          <FormControl component="fieldset">
            <FormLabel component="legend">{tracks[key].name}</FormLabel>
            <RadioGroup
              defaultValue="absent"
              name={tracks[key].id.toString()}
              onChange={this.handleRadioChange}
              value={this.state[tracks[key].id] || 'absent'}
            >
              <FormControlLabel
                value="present"
                control={(
                  <Radio
                    style={{ fontColor: 'black', color: '#5f77a1' }}
                  />
                  )}
                label={sched.OfficerPresent[fin]}
              />
              <FormControlLabel
                value="absent"
                control={(
                  <Radio
                    style={{ fontColor: 'black', color: '#5f77a1' }}
                  />
                  )}
                label={sched.OfficerAbsent[fin]}
              />
              <FormControlLabel
                value="closed"
                control={(
                  <Radio
                    style={{ fontColor: 'black', color: '#5f77a1' }}
                  />
                )}
                label={sched.Closed[fin]}
              />
            </RadioGroup>
            <TextareaAutosize
              className="notice"
              id={tracks[key].id}
              aria-label="Ilmoitus"
              rowsMin={1}
              rowsMax={3}
              onChange={this.handleNotice}
              value={tracks[key].notice !== null ? tracks[key].notice : ''}
              style={{ backgroundColor: '#f2f0eb' }}
            />
          </FormControl>
        </React.Fragment>,
      );
    }
    return (
      <>
        {items}
      </>
    );
  }

  // builds range officer select
  createSupervisorSelect = () => {
    const items = [];
    let disabled = false;
    const { sched } = data;
    const fin = localStorage.getItem('language');
    for (var key in this.state.rangeSupervisors) { // eslint-disable-line
      items.push(
        <MenuItem key={key} value={this.state.rangeSupervisors[key].id}>
          {this.state.rangeSupervisors[key].name}
        </MenuItem>,
      );
    }
    if (this.state.rangeSupervisorSwitch === false) {
      disabled = true;
    }

    return (
      <FormControl>
        <InputLabel id="chooserangeSupervisorLabel">{sched.Select[fin]}</InputLabel>
        <Select
          {...disabled && { disabled: true }}
          labelId="chooserangeSupervisorLabel"
          name="rangeSupervisorId"
          value={this.state.rangeSupervisorId}
          onChange={this.handleValueChange}
        >
          {items}
        </Select>
      </FormControl>
    );
  }

  async updateCall(date, rsId, srsId, rangeSupervisionScheduled, tracks, isRepeat) {
    return new Promise(async (resolve, reject) => { // eslint-disable-line
      let reservationMethod;
      let reservationPath = '';
      let scheduledRangeSupervisionMethod;
      let scheduledRangeSupervisionPath = '';

      // determine exist or not with:
      // reservationId: '',
      // scheduledRangeSupervisionId: '',
      // trackSupervisionId: '',
      if (rsId !== null) {
        reservationMethod = 'PUT';
        reservationPath = `/${rsId}`;
      } else reservationMethod = 'POST';

      if (srsId !== null) {
        scheduledRangeSupervisionMethod = 'PUT';
        scheduledRangeSupervisionPath = `/${srsId}`;
      } else scheduledRangeSupervisionMethod = 'POST';

      let params = {
        range_id: this.state.rangeId,
        available: this.state.available,
      };

      if (reservationMethod === 'POST') {
        // reservation can result in a duplicate which causes http 500
        params = {
          ...params,
          date: moment(date).format('YYYY-MM-DD'),
        };
      }

      const reservation = async (rsId, params, method, path) => { // eslint-disable-line
        try {
          return await fetch(`/api/reservation${path}`, {
            method,
            body: JSON.stringify(params),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.state.token}`,
            },
          })
            .then((res) => { // eslint-disable-line
            // 400 and so on
              if (!res.ok) {
                return reject(new Error('update reservation failed'));
              } if (res.status !== 204) {
                return res.json();
              }
            })
            .then((json) => {
            // pretty sure the code paths could be done better
              if (typeof rsId !== 'number' && json !== undefined) {
                rsId = json.id;  // eslint-disable-line
              }
              if (typeof rsId !== 'number') {
                return reject(new Error('no reservation id for schedule'));
              } return rsId;
            });
        } catch (error) {
          console.error('reservation', error);
          return reject(new Error('general reservation failure'));
        }
      };

      const reservationRes = await reservation(rsId, params, reservationMethod, reservationPath);
      // if res grabbed from previous post
      if (reservationRes !== undefined) {
        rsId = reservationRes; // eslint-disable-line
      }

      params = {
        range_reservation_id: rsId,
        open: moment(this.state.open).format('HH:mm'),
        close: moment(this.state.close).format('HH:mm'),
        supervisor_id: null,
      };

      if (this.state.rangeSupervisorSwitch) {
        if (this.state.rangeSupervisorId !== null) {
          params = {
            ...params,
            supervisor_id: this.state.rangeSupervisorId,
          };
        } else return reject(new Error('Range officer enabled but no id'));
      }

      const schedule = async (rsId, srsId, params, method, path) => {  // eslint-disable-line
        try {
          return await fetch(`/api/schedule${path}`, {
            method,
            body: JSON.stringify(params),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.state.token}`,
            },
          })
            .then((res) => { // eslint-disable-line
            // 400 and so on
              if (res.ok === false) {
                return reject(new Error('update schedule failed'));
              } if (res.status !== 204) {
                return res.json();
              }
            })
            .then((json) => {
              if (typeof srsId !== 'number' && json !== undefined) {
                srsId = json.id; // eslint-disable-line
              }
              if (typeof srsId !== 'number') {
                return reject(new Error('no schedule id for track supervision'));
              } return srsId;
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

      if (!this.state.available) {
        rangeStatus = 'closed';
      } else if (!this.state.rangeSupervisorSwitch) {
        rangeStatus = 'absent';
      } else if (this.state.rangeSupervisorId !== null
               && this.state.rangeSupervisorOriginal !== this.state.rangeSupervisorId) {
        rangeStatus = 'not confirmed';
      }

      if (rangeStatus !== null) {
        const rangeSupervisionRes = await rangeSupervision(
          rsId,
          srsId,
          rangeStatus,
          rangeSupervisionScheduled,
          this.state.token,
          this.state.rangeSupervisorId
        );
        if (rangeSupervisionRes !== true) {
          return reject(new Error(rangeSupervisionRes));
        }
      }

      const trackSupervision = async (srsId, key) => { // eslint-disable-line
        try {
          // update only ones changed in state
          if (this.state[this.state.tracks[key].id] !== undefined || isRepeat) {
            const statusInState = this.state[this.state.tracks[key].id];
            // if coming from repeat and status was cleared
            const supervisorStatus = statusInState !== undefined ? statusInState : 'absent';

            let { notice } = this.state.tracks[key];
            if (notice === null) {
              // undefined gets removed in object
              notice = undefined;
            }

            let params = { // eslint-disable-line
              track_supervisor: supervisorStatus,
              notice,
            };

            let srsp = '';
            let trackSupervisionMethod = '';
            // if scheduled track supervision exists -> put otherwise -> post
            if (tracks[key].scheduled) {
              trackSupervisionMethod = 'PUT';
              srsp = `/${srsId}/${this.state.tracks[key].id}`;
            } else {
              trackSupervisionMethod = 'POST';
              params = {
                ...params,
                scheduled_range_supervision_id: srsId,
                track_id: this.state.tracks[key].id,
              };
            }
            return await fetch(`/api/track-supervision${srsp}`, {
              method: trackSupervisionMethod,
              body: JSON.stringify(params),
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.token}`,
              },
            })
              .then((res) => { // eslint-disable-line
              // 400 and so on
                if (res.ok === false) {
                  return reject(new Error('update track supervision failed'));
                } if (res.status !== 204) {
                  return res.json();
                }
              });
          }
        } catch (error) {
          console.error('track supervision', error);
          return reject(new Error('general track supervision failure'));
        }
      };
      for (let key in this.state.tracks) { // eslint-disable-line
        try {
          const trackSupervisionRes = await trackSupervision(srsId, key);  // eslint-disable-line
        } catch (error) {
          return reject(error);
        }
      }

      return resolve('update success');
    });
  }

  update() {
    const request = async () => {
      const response = await getSchedulingDate(this.state.date);

      if (response !== false) {
        // console.log("Results from api",response);

        this.setState({
          date: moment(response.date),
          rangeId: response.rangeId,
          reservationId: response.reservationId,
          scheduleId: response.scheduleId,
          open: response.open !== null
            ? moment(response.open, 'h:mm:ss').format()
            : moment(response.date)
              .hour(17)
              .minute(0)
              .second(0),
          close: response.close !== null
            ? moment(response.close, 'h:mm:ss').format()
            : moment(response.date)
              .hour(20)
              .minute(0)
              .second(0),
          available: response.available !== null ? response.available : false,
          rangeSupervisorSwitch: response.rangeSupervisorId !== null,
          rangeSupervisorId: response.rangeSupervisorId,
          rangeSupervisorOriginal: response.rangeSupervisorId,
          rangeSupervisionScheduled: response.rangeSupervisionScheduled,
          tracks: response.tracks,
          state: 'ready',
        });
        // set current track state for scheduled
        for (var key in response.tracks) { // eslint-disable-line
          if (response.tracks[key].scheduled) {
            this.setState({
              [this.state.tracks[key].id]: this.state.tracks[key].trackSupervision,
            });
          } else { // clears track states between date changes
            this.setState({
              [this.state.tracks[key].id]: undefined,
            });
          }
        }
      } else console.error('getting info failed');
    };
    request();
  }

  render() {
    function Alert(props) {
      return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    const { sched } = data;
    const fin = localStorage.getItem('language');

    return (
      <div className="schedulingRoot">
        <Modal open={this.state.state !== 'ready'} onClick={this.handleBackdropClick}>
          <Backdrop open={this.state.state !== 'ready'} onClick={this.handleBackdropClick}>
            <CircularProgress disableShrink />
          </Backdrop>
        </Modal>

        {/* Section for selecting date */}
        <div className="firstSection">
          <form onSubmit={this.continueWithDate}>

            { /* Datepicker */}
            <MuiPickersUtilsProvider
              utils={MomentUtils}
              locale={lang}
              key={this.state.datePickerKey}
            >
              <KeyboardDatePicker
                autoOk
                margin="normal"
                name="date"
                label={sched.Day[fin]}
                value={this.state.date}
                onChange={(date) => this.handleDateChange(date)}
                onAccept={this.handleDatePickChange}
                format="DD.MM.YYYY"
                showTodayButton
              />
            </MuiPickersUtilsProvider>
            <div className="continue">
              <Button type="submit" variant="contained" style={{ backgroundColor: '#d1ccc2' }}>{sched.Day[fin]}</Button>
            </div>
          </form>
        </div>

        <hr />

        {/* Section for setting range officer status and open/close times of the tracks */}
        <div className="secondSection">
          <div className="topRow">
            <div className="text">{sched.Open[fin]}</div>

            <Switch
              checked={this.state.available}
              onChange={this.handleSwitchChange}
              name="available"
              color="primary"
              style={{ color: '#5f77a1' }}
            />
          </div>
          <div className="middleRow">
            <div className="roSwitch">
              <div className="text">{sched.Supervisor[fin]}</div>
              <Switch
                className="officerSwitch"
                checked={this.state.rangeSupervisorSwitch}
                onChange={this.handleSwitchChange}
                name="rangeSupervisorSwitch"
                color="primary"
                style={{ color: '#5f77a1' }}
              />
            </div>
            {this.createSupervisorSelect()}
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
                value={this.state.open}
                onChange={this.handleTimeStartChange}
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
                value={this.state.close}
                onChange={this.handleTimeEndChange}
                minutesStep={5}
                showTodayButton
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>

        <hr />

        {/* Section for setting track-specific open/close/absent statuses */}
        <div className="thirdSection">
          <div className="leftSide">
            {this.createTrackList()}
          </div>
          <div className="rightSide">
            <Button variant="contained" color="primary" onClick={this.openAllTracks} style={{ color: 'black', backgroundColor: '#5f77a1' }}>{sched.OpenAll[fin]}</Button>
            <Button variant="contained" onClick={this.emptyAllTracks} style={{ backgroundColor: '#d1ccc2' }}>{sched.ClearAll[fin]}</Button>
            <Button variant="contained" color="secondary" onClick={this.closeAllTracks} style={{ color: 'black', backgroundColor: '#c97b7b' }}>{sched.CloseAll[fin]}</Button>
          </div>
        </div>
        <hr />
        <div className="fourthSection">
          <div className="repetition">
            <div className="daily">
              {sched.RepeatDaily[fin]}
              <Switch
                checked={this.state.daily}
                onChange={this.handleRepeatChange}
                id="daily"
                color="primary"
                style={{ color: '#5f77a1' }}
              />
            </div>
            <div className="weekly">
              {sched.RepeatWeekly[fin]}
              <Switch
                checked={this.state.weekly}
                onChange={this.handleRepeatChange}
                id="weekly"
                color="primary"
                style={{ color: '#5f77a1' }}
              />
            </div>
            <div className="monthly">
              {sched.RepeatMonthly[fin]}
              <Switch
                checked={this.state.monthly}
                onChange={this.handleRepeatChange}
                id="monthly"
                color="primary"
                style={{ color: '#5f77a1' }}
              />
            </div>
            <div className="repeatCount">
              {sched.Amount[fin]}
              <TextField
                name="repeatCount"
                type="number"
                value={this.state.repeatCount}
                onChange={this.handleValueChange}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </div>
          </div>
          <div className="save">
            <Button variant="contained" onClick={this.saveChanges} style={{ backgroundColor: '#d1ccc2' }}>{sched.Save[fin]}</Button>
            <div
              className="hoverHand arrow-right"
              onClick={() => this.handleDatePickChange(moment(this.state.date).add(1, 'days').format('YYYY-MM-DD'))}
            />
            <div className="toast">
              <Snackbar
                open={this.state.toast}
                autoHideDuration={5000}
                onClose={this.handleSnackbarClose}
              >
                <Alert onClose={this.handleSnackbarClose} severity={this.state.toastSeverity}>
                  {this.state.toastMessage}
                  !
                </Alert>
              </Snackbar>
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export default Scheduling;
