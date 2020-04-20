import React, { Component } from "react";
import './App.css';
import './Scheduling.css'
import MomentUtils from '@date-io/moment';
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
import { getSchedulingDate } from "./utils/Utils";
import moment from 'moment';
import "moment/locale/fi";
moment.locale("fi");

async function getRangeSupervisors(token){
  try{
    let response = await fetch("/api/user?role=supervisor", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return await response.json();
  }catch(err){
    console.error("GETTING USER FAILED",err);
    return false;
  }
}

class Scheduling extends Component {

  constructor(props) {
      super(props);
      this.state = {
        state: 'loading', //loading, ready
        toast:false,
        toastMessage:'Nope',
        toastSeverity:'success',
        date: new Date(),
        rangeId: '',
        reservationId:'',
        scheduleId:'',
        open: new Date(),
        close: new Date(),
        available: false,
        rangeSupervisorSwitch: false,
        rangeSupervisorId: '',
        rangeSupervisionScheduled: false,
        daily:false,
        weekly:false,
        monthly:false,
        repeatCount:1,
        token:'SECRET-TOKEN'
      };
  }
  
  componentDidMount(){
    console.log("MOUNTED",localStorage.getItem('token'));
    this.setState({
      token: localStorage.getItem('token')
    },function(){
      if(this.state.token === 'SECRET-TOKEN'){
        this.props.history.push("/");
      }
      else{
        try{
          const request = async () => {
            const response = await getRangeSupervisors(this.state.token);
            if(response !== false){
              this.setState({
                rangeSupervisors: response
              });
              this.update();
              this.setState({
                state: 'loading'
              });
            } 
            else {
              console.error("getting user failed, most likely sign in token invalid -> kicking to root");
              this.props.history.push("/");
            }
          }
          request();
        }
        catch(error){
          console.error("init failed",error);
        }
      }
    })
  }
  
  update(){
    console.log("update state");
    
    const request = async () => {
      const response = await getSchedulingDate(this.state.date);

      if(response !== false){
        console.log("Results from api",response);

        this.setState({
          date: moment(response.date),
          rangeId: response.rangeId,
          reservationId: response.reservationId,
          scheduleId: response.scheduleId,
          open: response.open !== null ? 
            moment(response.open, 'h:mm:ss').format() :
            moment(response.date)
            .hour(17)
            .minute(0)
            .second(0),
          close:  response.close !== null ? 
            moment(response.close, 'h:mm:ss').format() :
            moment(response.date)
            .hour(20)
            .minute(0)
            .second(0),
          available:response.available !== null ? response.available : false,
          rangeSupervisorSwitch: response.rangeSupervisorId !== null ? true : false,
          rangeSupervisorId: response.rangeSupervisorId,
          rangeSupervisionScheduled: response.rangeSupervisionScheduled,
          tracks: response.tracks,
          state:'ready'
        });
        //set current track state for scheduled
        for (var key in response.tracks) {
          if(response.tracks[key].scheduled){
            this.setState({
              [this.state.tracks[key].id]: this.state.tracks[key].trackSupervision
            });
          }
          //clears track states between date changes
          else {
            this.setState({
              [this.state.tracks[key].id]: undefined
            });
          }
        }
      } else console.error("getting info failed");
    } 
    request();
  }
  
  //if these all tracks can work with track changes only changed updates could be sent
  //there's a bug somewhere that makes state handling here a pain
  openAllTracks = () => {        
    console.log("Open tracks");
    for (var key in this.state.tracks) {
      this.setState({
        [this.state.tracks[key].id]: 'present'
      });
    }
  };
  
  emptyAllTracks = () => {
    console.log("Empty tracks");
    for (var key in this.state.tracks) {
      this.setState({
        [this.state.tracks[key].id]: 'absent'
      });
    }
  };

  closeAllTracks = () => {
    console.log("Close tracks");
    for (var key in this.state.tracks) {
      this.setState({
        [this.state.tracks[key].id]: 'closed'
      });
    }
  };

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
  async updateCall(date,rsId,srsId,rangeSupervisionScheduled,tracks,isRepeat){
    return new Promise(async (resolve,reject) => {
      console.log("UPDATE CALL",date,rsId,srsId);
      
      let reservationMethod;
      let reservationPath = "";
      let scheduledRangeSupervisionMethod;
      let scheduledRangeSupervisionPath = "";
      
      //determine exist or not with:
      //reservationId:'',
      //scheduledRangeSupervisionId:'',
      //trackSupervisionId:'',
      if(rsId !== null){
        reservationMethod = 'PUT';
        reservationPath = "/"+rsId;
      } else reservationMethod = 'POST';
      
      if(srsId !== null){
        scheduledRangeSupervisionMethod = 'PUT';
        scheduledRangeSupervisionPath = "/"+srsId;
      } else scheduledRangeSupervisionMethod = 'POST';

      console.log("PRE SEND",rsId===null,srsId===null);
      console.log("PRE SEND",rsId,srsId);
      console.log("PRE SEND",reservationMethod,scheduledRangeSupervisionMethod);
      
      let params = {
        range_id: this.state.rangeId,  
        available: this.state.available
      };
      
      if(reservationMethod === 'POST'){
        //reservation can result in a duplicate which causes http 500 
        //error: duplicate key value violates unique constraint "range_reservation_range_id_date_unique"
        params = {
          ...params,
          date: moment(date).format('YYYY-MM-DD')
        }
      }
      console.log("reservation params",params)      
      
      
      /*
      *  Reservation
      */
      const reservation = async (rsId,params,method,path) => {
        //reservation
        try{
          return await fetch("/api/reservation"+path, {
            method: method,
            body: JSON.stringify(params),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.state.token}`
            }
          })
          .then(res => {
            console.log("reservation res",res)
            //400 and so on
            if(res.ok === false){
              return reject(new Error('update reservation failed'));
            }
            else if(res.status !== 204){
              return res.json();
            }
            else return;
          })
          .then(json => {
            console.log("reservation success",json);
            if(typeof rsId !== 'number' && json !== undefined){
              console.log("rsId grabbed from result")
              rsId = json.id;
            }
            console.log("rsId",rsId,(typeof rsId !== 'number'),typeof rsId)
            if(typeof rsId !== 'number'){
              return reject(new Error('no reservation id for schedule'));
            }
            else return rsId;
          });
        }catch(error){
          console.error("reservation",error);
          return reject(new Error('general reservation failure'));
        }
      }
      const reservationRes = await reservation(rsId,params,reservationMethod,reservationPath);
      console.log("reservationRes",reservationRes);
      //if res grabbed from previous post
      if(reservationRes !== undefined){
        rsId = reservationRes;
      }
      
      params = {
        range_reservation_id: rsId,
        open: moment(this.state.open).format('HH:mm'), 
        close: moment(this.state.close).format('HH:mm'),
        supervisor_id: null
      };
      if(this.state.rangeSupervisorSwitch === true){
        if(this.state.rangeSupervisorId !== null){
          params = {
            ...params,
            supervisor_id: this.state.rangeSupervisorId
          };
        }
        else return reject(new Error('Range officer enabled but no id'));
      }
      console.log("schedule params",params)
      
      
      /*
      *  Schedule
      */
      const schedule = async (rsId,srsId,params,method,path) => {
        //scheduled range supervision
        try{
          return await fetch("/api/schedule"+path, {
            method: method,
            body: JSON.stringify(params),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.state.token}`
            }
          })
          .then(res => {
            console.log("schedule res",res)
            //400 and so on
            if(res.ok === false){
              return reject(new Error('update schedule failed'));
            }
            else if(res.status !== 204){
              return res.json();
            }
            else return;
          })
          .then(json => {
            console.log("sched success",json);
            if(typeof srsId !== 'number' && json !== undefined){
              console.log("srsId grabbed from result")
              srsId = json.id;
            }
            
            console.log("srsId",srsId,(typeof srsId !== 'number'),typeof srsId)
            if(typeof srsId !== 'number'){
              return reject(new Error('no schedule id for track supervision'));
            }
            else return srsId;
          });
        }catch(error){
          console.error("schedule",error);
          return reject(new Error('general schedule failure'));
        }
      }
      const scheduleRes = await schedule(rsId,srsId,params,scheduledRangeSupervisionMethod,scheduledRangeSupervisionPath);
      console.log("scheduleRes",scheduleRes);
      //if res grabbed from previous post
      if(scheduleRes !== undefined){
        srsId = scheduleRes;
      }
      
      /*
      *  Range supervision
      */
      let rangeStatus = null;
      if(this.state.available === false){
        rangeStatus = 'closed';
      }
      else if(this.state.rangeSupervisorSwitch === false){
        rangeStatus = 'absent';
      }
      else if(this.state.rangeSupervisorId !== null){
        rangeStatus = 'not confirmed';
      }
      
      const rangeSupervision = async (rsId,srsId,rangeStatus,rsScheduled,token) => {
        console.log("range supvis params",rsId,srsId,rangeStatus,token);
        try{
          if(rsId !== null && srsId !== null){
            //only closed is different from the 6 states
            if(rangeStatus !== 'closed'){
              //range supervision exists
              if(rsScheduled){
                fetch(`/api/reservation/${rsId}`, {
                  method: "PUT",
                  body: JSON.stringify({available: true}),
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  }
                })
                .then(status => {
                  console.log("put available",status)
                  fetch(`/api/range-supervision/${srsId}`, {
                    method: "PUT",
                    body: JSON.stringify({range_supervisor: rangeStatus}),
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    }
                  })
                  .then(status => console.log("put rangeSupervision",status));
                });
              }
              else{
                fetch(`/api/reservation/${rsId}`, {
                  method: "PUT",
                  body: JSON.stringify({available: true}),
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  }
                })
                .then(status => {
                  console.log(status)
                  console.log("put available",status)
                  fetch(`/api/range-supervision`, {
                    method: "POST",
                    body: JSON.stringify({
                      scheduled_range_supervision_id:srsId,
                      range_supervisor: rangeStatus
                    }),
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    }
                  })
                  .then(status => console.log("post rangeSupervision", status));
                });
              }
            }
            else{
              fetch(`/api/reservation/${rsId}`, {
                method: "PUT",
                body: JSON.stringify({available: 'false'}),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.state.token}`
                }
              })
              .then(status => console.log("put available",status));
            }
          }else console.error("cannot update some parts (reservation or schedule) missing");
        }catch(error){
          console.error("range supervision",error);
          return reject(new Error('general range supervision failure'));
        }
      }
      if(rangeStatus !== null){
        const rangeSupervisionRes = await rangeSupervision(rsId,srsId,rangeStatus,rangeSupervisionScheduled,this.state.token);
        console.log("rangeSupervisionRes",rangeSupervisionRes,rangeSupervisionScheduled);
      }
      else console.log("range status null")
      
      /*
      *  Track supervision
      */
      const trackSupervision = async (srsId,key) => {
        try{
          //track supervision
          //update only ones changed in state
          if(this.state[this.state.tracks[key].id] !== undefined || isRepeat){
            let supervisorStatus;
            let statusInState = this.state[this.state.tracks[key].id];
            //if coming from repeat and status was cleared
            supervisorStatus = statusInState !== undefined ? statusInState : 'absent';
            
            let notice = this.state.tracks[key].notice;
            if(notice === null || notice !== ""){
              //undefined gets removed in object
              notice=undefined;
            }
            
            let params = {
              track_supervisor: supervisorStatus,
              notice:notice
            };            
            
            let srsp = '';
            let trackSupervisionMethod = '';
            //if scheduled track supervision exists -> put otherwise -> post
            if(tracks[key].scheduled){
              trackSupervisionMethod = 'PUT';
              srsp = "/" + srsId + '/' + this.state.tracks[key].id;
            } 
            else
            {
              trackSupervisionMethod = 'POST';
              params = {
                ...params,
                scheduled_range_supervision_id:srsId,
                track_id:this.state.tracks[key].id
              };
            }
            console.log("track supvis params",params,"srsp",srsp,trackSupervisionMethod, "track scheduled:",this.state.tracks[key].scheduled);
            
            return await fetch("/api/track-supervision"+srsp, {
              method: trackSupervisionMethod,
              body: JSON.stringify(params),
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.token}`
              }
            })
            .then(res => {
              console.log("track supervision res",res)
              //400 and so on
              if(res.ok === false){
                return reject(new Error('update track supervision failed'));
              }
              else if(res.status !== 204){
                return res.json();
              }
              else return;
            })
            .then(json => {
              console.log("track supervision "+this.state.tracks[key].name+" "+this.state.tracks[key].name+" success",json);
              return;
            });
          }
        }catch(error){
          console.error("track supervision",error);
          return reject(new Error('general track supervision failure'));
        }
      }
      for (let key in this.state.tracks) {
        try{
          const trackSupervisionRes = await trackSupervision(srsId,key);
          console.log("trackSupervisionRes",trackSupervisionRes);
        }catch(error){
          return reject(error);
        }
      }
      
      return resolve("update success")
    })
  }

  render() {
  
    const selectedDate = this.state.date;
    const handleDateChange = (date) => {
      this.setState({
        date: date
      });
    };
    
    const handleDatePickChange = (date) => {
      this.setState({
        date: date
      },
      function() {
        continueWithDate();
      });
    };
    
    const continueWithDate = (event) => {
      if(event !== undefined && event.type !== undefined && event.type === 'submit'){
        event.preventDefault();
      }
      this.setState({
        state: 'loading',
      },
      function() {
        console.log("TIME IS",this.state.date);
        this.update();
      });
    }
    
    const selectedTimeStart = this.state.open;
    const handleTimeStartChange = (date) => {
      this.setState({
         open: date
      });
    };
   
    const selectedTimeEnd = this.state.close;
    const handleTimeEndChange = (date) => {
      this.setState({
         close: date
      });
    };
    
    const handleSwitchChange = (event) => {
      console.log("Switch",event.target.name, event.target.checked)
      this.setState({
         [event.target.name]: event.target.checked
      });
    };
    
    const handleRepeatChange = (event) => {
      console.log("Repeat",event.target.id, event.target.checked)
      
      let daily = false;
      let weekly = false;
      let monthly = false;
      
      if(event.target.id === 'daily'){
        daily = !this.state.daily;
      }
      else if(event.target.id === 'weekly'){
        weekly = !this.state.weekly;
      }
      else if(event.target.id === 'monthly'){
        monthly = !this.state.monthly;
      }
      
      this.setState({
        daily: daily,
        weekly: weekly,
        monthly: monthly
      });
    };
    
    function Alert(props) {
      return <MuiAlert elevation={6} variant="filled" {...props} />;
    }
    
    const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      
      this.setState({
        toast:false
      });
    };
    
    const handleRadioChange = (event) => {
      console.log("Radio",event.target.name, event.target)
      //having the name be a int causes
      //Failed prop type: Invalid prop `name` of type `number`
      this.setState({
        [event.target.name]: event.target.value
      });
    };
    
    const handleValueChange = (event) => {
      console.log("Value change",event.target.name, event.target.value)
      this.setState({
         [event.target.name]: event.target.value
      });
    };
    
    const handleBackdropClick = (event) => {
      console.log("Backdrop clicked",event);
      event.preventDefault();
    };
    
    const handleNotice = (event) => {
      console.log("handle notice",event.target.id,event.target.value,this.state.tracks)
      let idx = this.state.tracks.findIndex((findItem) => findItem.id === parseInt(event.target.id));
      let tracks = this.state.tracks;
      tracks[idx].notice = event.target.value;
      
      this.setState({
         tracks:tracks
      },function(){
        console.debug(this.state);
      });
    }
    
    const saveChanges = async (event) => {
      console.log("save")
      
      //start spinner
      this.setState({
        state: 'loading'
      });
      
      //update call/error handling
      const update = async (date,rsId,srsId,rangeSupervisionScheduled,tracks,isRepeat) => {
        console.log("Gonna call update",date,rsId,srsId,rangeSupervisionScheduled,tracks);
        await this.updateCall(date,rsId,srsId,rangeSupervisionScheduled,tracks,isRepeat).then((res) => {
          this.setState({
            toast: true,
            toastMessage: "Päivitys onnistui",
            toastSeverity: "success"
          });
        },
        (error) => {
          console.error('Update rejection called: ' + error.message);
          if(error.message === 'Range officer enabled but no id'){
            this.setState({
              toastMessage: "Päävalvoja aktiivinen ilman valvojaa",
              toastSeverity: "warning",
              toast: true,
            });
          }
          else{
            this.setState({
              toastMessage: "Päivitys epäonnistui",
              toastSeverity: "error",
              toast: true,
            });
          }
        })
      }
      
      const repeat = async () => {
        let date = moment(this.state.date).format('YYYY-MM-DD');
        await update(
          date,
          this.state.reservationId,
          this.state.scheduleId,
          this.state.rangeSupervisionScheduled,
          this.state.tracks,
          false
        );
        
        //repeat after me
        if(this.state.daily === true || 
           this.state.weekly === true || 
           this.state.monthly === true
        ){
          for (var i = 0; i < this.state.repeatCount; i++) {
            if(this.state.daily === true){
              date = moment(date).add(1, 'days');
            }
            else if(this.state.weekly === true){
              date = moment(date).add(1, 'weeks');
            }
            else if(this.state.monthly === true){
              date = moment(date).add(1, 'months');
            }
            
            let response = await updateRequirements(moment(date).format('YYYY-MM-DD'))
            await update(
              date,
              response.reservationId,
              response.scheduleId,
              response.rangeSupervisionScheduled,
              response.tracks,
              true
            );
          }
        }
      }
      await repeat();
      //update here not necessarily needed but fixes 
      //when saved to a new date with post and then immediately after
      //saving again without updating ids.
      this.update();
      this.setState({
        state: 'ready'
      });
    };
    
    //fetch new requirements for the next day
    const updateRequirements = async (date) => {
      console.log("UPDATE REQUIREMENTS",date);
      const request = async (date) => {
        const response = await getSchedulingDate(date);

        if(response !== false){
          console.log("During update base results from api",response);
        }
        else console.error('Getting base info failed');
        return response;
      }
      return await request(date);
    }

    //builds tracklist
    function TrackList(props) {
      let items = [];
      for (var key in props.tracks) {
        items.push(
          <React.Fragment
          key={key}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{props.tracks[key].name}</FormLabel>
                <RadioGroup 
                  defaultValue="absent" 
                  name={props.tracks[key].id} 
                  onChange={handleRadioChange}
                  value={ props.state[props.tracks[key].id] || 'absent'}
                >
                  <FormControlLabel value="present" control={<Radio />} label="Valvoja paikalla" />
                  <FormControlLabel value="absent" control={<Radio />} label="Ei valvojaa" />
                  <FormControlLabel value="closed" control={<Radio />} label="Suljettu" />
                </RadioGroup>
                <TextField 
                  //track_id
                  id={props.tracks[key].id}
                  type="text" 
                  onChange={handleNotice}
                  value={props.tracks[key].notice}
                />
            </FormControl>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          {items}
        </React.Fragment>
      );
    }
    
    //builds range officer select
    function RangeSupervisorSelect (props) {
      let items = [];
      let disabled = false;
      
      for (var key in props.rangeSupervisors) {
        items.push(
          <MenuItem key={key} value={props.rangeSupervisors[key].id}>{props.rangeSupervisors[key].name}</MenuItem>
        );
      }
      
      if (props.state.rangeSupervisorSwitch === false) {
        disabled=true
      };

      return (
        <FormControl>
          <InputLabel id="chooserangeSupervisorLabel">Valitse valvoja</InputLabel>
          <Select
            {...disabled && {disabled: true}}
            labelId="chooserangeSupervisorLabel"
            name="rangeSupervisorId"
            value={props.state.rangeSupervisorId}
            onChange={handleValueChange}
          >
            {items}
          </Select>
        </FormControl>
      );
    }
    


    return (
      <div className="schedulingRoot">
        <Modal open={this.state.state!=='ready'?true:false} onClick={handleBackdropClick}>
          <Backdrop open={this.state.state!=='ready'?true:false} onClick={handleBackdropClick}>
            <CircularProgress disableShrink />
          </Backdrop>
        </Modal>
        <div className="firstSection">
          <form onSubmit={continueWithDate}>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={'fi'}>
              <KeyboardDatePicker
                autoOk
                margin="normal"
                name="date"
                label="Valitse päivä"
                value={selectedDate}
                onChange={date => handleDateChange(date)}
                onAccept={handleDatePickChange}
                format="DD.MM.YYYY"
                showTodayButton
              />
            </MuiPickersUtilsProvider>
            <div className="continue">
              <Button type="submit" variant="contained">Valitse päivä</Button>
            </div>
          </form>
        </div>
        <hr/>
        <div className="secondSection">
          <div className="topRow">
            <div className="text">Keskus auki</div>
            <Switch
              checked={ this.state.available }
              onChange={handleSwitchChange}
              name="available"
            />
          </div>
          <div className="middleRow">
            <div className="roSwitch">
              <div className="text">Päävalvoja</div>
              <Switch
                className="officerSwitch"
                checked={this.state.rangeSupervisorSwitch}
                onChange={handleSwitchChange}
                name="rangeSupervisorSwitch"
              />
            </div>
            {/*Butchered state?*/}
            <RangeSupervisorSelect 
              rangeSupervisors={this.state.rangeSupervisors}
              state={this.state} 
            />
          </div>
          <div className="bottomRow">
            <div className="text">Aukioloaika</div>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={'fi'}>
              <KeyboardTimePicker
                autoOk
                ampm={false}
                margin="normal"
                name="start"
                label="Alku"
                value={selectedTimeStart}
                onChange={handleTimeStartChange}
                minutesStep={5}
                showTodayButton
              />
            </MuiPickersUtilsProvider>
            <div className="dash">-</div>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={'fi'}>
              <KeyboardTimePicker
                autoOk
                ampm={false}
                margin="normal"
                name="end"
                label="Loppu"
                value={selectedTimeEnd}
                onChange={handleTimeEndChange}
                minutesStep={5}
                showTodayButton
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>
        <hr/>
        <div className="thirdSection">
          <div className="leftSide">
            {/*Butchered state?*/}
            <TrackList 
              tracks={this.state.tracks}
              state={this.state} 
            />
          </div>
          <div className="rightSide">
            <Button variant="contained" color="primary" onClick={this.openAllTracks}>Avaa kaikki</Button>
            <Button variant="contained" onClick={this.emptyAllTracks}>Tyhjennä kaikki</Button>
            <Button variant="contained" color="secondary" onClick={this.closeAllTracks}>Sulje kaikki</Button>
          </div>
        </div>
        <hr/>
        <div className="fourthSection">
          <div className="repetition">
            <div className="daily">
              Toista päivittäin
              <Switch
                checked={ this.state.daily }
                onChange={handleRepeatChange}
                id='daily'
              />
            </div>
            <div className="weekly">
              Toista viikottain
              <Switch
                checked={ this.state.weekly }
                onChange={handleRepeatChange}
                id='weekly'
              />
            </div>
            <div className="monthly">
              Toista kuukausittain
              <Switch
                checked={ this.state.monthly }
                onChange={handleRepeatChange}
                id='monthly'
              />
            </div>
            <div className="repeatCount">
              Toistojen määrä
              <TextField 
                name="repeatCount"
                type="number" 
                value={this.state.repeatCount} 
                onChange={handleValueChange}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </div>
          </div>
          <div className="save">
            <Button variant="contained" onClick={saveChanges}>Tallenna muutokset</Button>
            <div className="toast">
              <Snackbar open={this.state.toast} autoHideDuration={5000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={this.state.toastSeverity}>
                  {this.state.toastMessage}!
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