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
import moment from 'moment';
import "moment/locale/fi";
moment.locale("fi");

class Scheduling extends Component {

  constructor(props) {
      super(props);
      this.state = {
        state: 'loading', //loading, ready
        toast:false,
        toastMessage:'Nope',
        toastSeverity:'success',
        date: new Date(),
        start: new Date(),
        end: new Date(),
        rangeOfficerSwitch: false,
        rangeOfficerId: '',
        trackChanges: {},
        daily:false,
        weekly:false,
        monthly:false,
        repeatCount:1,
        token:'SECRET-TOKEN',
        reservationId:'',
        scheduledRangeSupervisionId:'',
        range_id: ''
      };
  }
  
  componentDidMount(){
    console.log("MOUNTED");
    this.getTracks();
    this.getRangeOfficers();
    this.update();
    
    this.setState({
      state: 'loading'
    });
  }
  
  update(avoidEmpty){
    if(avoidEmpty  === true){
      this.emptyAllTracks();
    }
    console.log("update",this.state.rangeOfficerId,this.state.start,this.state.end);
    this.getReservation();
  }
  
  handleEmpty(error){
    console.log("handleempty",error);
    if(error === 'reservation empty'){
      this.setState({
        reservationId:''
      });
    }
    
    if(error === 'reservation empty' || error === 'schedule empty'){
      this.setState({
        scheduledRangeSupervisionId:'',
        start: moment(this.state.date)
          .hour(0)
          .minute(0)
          .second(0),
        end: moment(this.state.date)
          .hour(0)
          .minute(0)
          .second(0),
        rangeOfficerSwitch:'',
        rangeOfficerId:''
      });
    }
    
    this.emptyAllTracks();
    this.setState({
      state:'ready'
    });
  }
  
  getTracks(){
    fetch("/api/track", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`
      }
    })
    .then(res => {
      return res.json()
    })
    .then(json => {
      console.log("gettracks",json)
      this.setState({
         tracks: json,
         range_id: json[0].range_id //roundabout way to grab range_id for now
      })
    });
  }
  
  getRangeOfficers(){
    fetch("/api/user", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`
      }
    })
    .then(res => res.json())
    .then(json => {
      this.setState({
         rangeOfficers: json
      })
    });
  }
  
  getReservation(){
    this.getReservationInfo(this.state.date).then((res)=>{
      let rsId = res;
      this.setState({
        reservationId:rsId
      },
      function() {
        this.getSchedule();
      });
    },
    //promise error
    (error)=> {
      console.error(error);
      this.handleEmpty(error.message);
    });
  }
  
  //return:
  //  reservation id
  async getReservationInfo(date){
    return new Promise((resolve,reject) => {
      fetch("/api/reservation?date="+moment(date).format('YYYY-MM-DD'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        console.log("RESERVATION",json)
        let rsId = '';
        if(json.length > 0){
          rsId = json[0].id
        }
        else{
          return reject(new Error('reservation empty'));
        }
        return resolve(rsId);
      });
    });
  }
  
  getSchedule(){
    this.getScheduleInfo(this.state.reservationId).then((res)=>{
      let gsiObj = res;
      this.setState({
        rangeOfficerSwitch: gsiObj.rangeOfficerSwitch,
        rangeOfficerId:(gsiObj.rangeOfficerId !== null ? gsiObj.rangeOfficerId : ''),
        start: gsiObj.start,
        end: gsiObj.end,
        scheduledRangeSupervisionId: gsiObj.scheduledRangeSupervisionId
      },
      function() {
        this.getTracksupervision(this.state.scheduledRangeSupervisionId);
      })
    },
    //promise error
    (error)=> {
      console.error(error);
      this.handleEmpty(error.message);
    });
  }
  
  //return:
  //  rangeOfficerId
  //  start
  //  end
  //  rangeOfficerSwitch
  //  scheduledRangeSupervisionId
  async getScheduleInfo(reservationId){
    return new Promise((resolve,reject) => {
      fetch("/api/schedule?range_reservation_id="+reservationId, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        console.log("reservationid",reservationId)
        console.log("SCHEDULE",json)
        let rangeOfficerId = '';
        let start = 0;
        let end = 0;
        let rangeOfficerSwitch = false;
        let scheduledRangeSupervisionId = '';
        
        if(json.length > 0){
          console.log("resid",json[0].supervisor_id,start)
          rangeOfficerId = json[0].supervisor_id;
          start = moment(json[0].open, 'h:mm:ss').format();
          end = moment(json[0].close, 'h:mm:ss').format();
          rangeOfficerSwitch = json[0].supervisor_id !== null ? true : false;
          scheduledRangeSupervisionId = json[0].id;
          console.log("resid",rangeOfficerId,start,end)
        }
        else{
          return reject(new Error('schedule empty'));
        }
        
        return resolve({
          rangeOfficerId:rangeOfficerId,
          start:start,
          end:end,
          rangeOfficerSwitch:rangeOfficerSwitch,
          scheduledRangeSupervisionId:scheduledRangeSupervisionId,
        });
      });
    });
  }
  
  async getTracksupervision(srsId){
    return new Promise((resolve,reject) => {

      fetch("/api/track-supervision?scheduled_range_supervision_id="+srsId, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        console.log("scheduledRangeSupervisionId",this.state.scheduledRangeSupervisionId)
        console.log("TRACK SUPERVISION",json)
        
        if(json.length > 0){
          //lovely bubble sort speeds
          //sets tracks that have supervisor present to active
          for (var key in this.state.tracks) {
            for (var jkey in json) {
              //match
              if(this.state.tracks[key].id === json[jkey].track_id){
                if(json[jkey].track_supervisor === 'present' || json[jkey].track_supervisor === 'closed'){
                  this.setState({
                    [this.state.tracks[key].id]: json[jkey].track_supervisor
                  });
                }
                else {
                  this.setState({
                    [this.state.tracks[key].id]: 'absent'
                  });
                }
              }
            }
          }
        }

        //at the end stop spinner
        //existing clarifies whether to use post or put later
        this.setState({
          existingTracks: json,
          state:'ready'
        },
        function() {
          return resolve();
        });
      });
    })
  }
  
  //if these all tracks can work with trackChanges only changed updates could be sent
  //there's a bug somewhere that makes state handling here a pain
  openAllTracks = () => {        
    console.log("Open tracks");
    for (var key in this.state.tracks) {
      let trackChanges = {
        ...this.state.trackChanges,
        [this.state.tracks[key].id]: 'present'
      }
      
      this.setState({
        trackChanges: trackChanges,
        [this.state.tracks[key].id]: 'present'
      });
    }
  };
  
  emptyAllTracks = () => {
    console.log("Empty tracks");
    for (var key in this.state.tracks) {
      let trackChanges = {
        ...this.state.trackChanges,
        [this.state.tracks[key].id]: 'absent'
      }
      
      this.setState({
        trackChanges: trackChanges,
        [this.state.tracks[key].id]: 'absent'
      });
    }
  };

  closeAllTracks = () => {
    console.log("Close tracks");
    for (var key in this.state.tracks) {
      let trackChanges = {
        ...this.state.trackChanges,
        [this.state.tracks[key].id]: 'closed'
      }
      
      this.setState({
        trackChanges: trackChanges,
        [this.state.tracks[key].id]: 'closed'
      });
    }
  };

  /*
  * requires:
  * date,
  * reservationId,
  * scheduledRangeSupervisionId,
  *
  * from state:
  * this.state.range_id
  * this.state.token
  * this.state.rangeOfficerSwitch
  * this.state.start
  * this.state.end
  * this.state.rangeOfficerId
  * this.state.tracks
  * this.state.existingTracks
  * supervisorStatus = this.state[this.state.tracks[key].id]
  */
  async updateCall(date,rsId,srsId){
    return new Promise((resolve,reject) => {

      console.log("UPDATE CALL",date,rsId,srsId);
      
      
      let reservationMethod;
      let reservationPath = "";
      let scheduledRangeSupervisionMethod;
      let scheduledRangeSupervisionPath = "";
      
      //determine exist or not with:
      //reservationId:'',
      //scheduledRangeSupervisionId:'',
      //trackSupervisionId:'',
      if(rsId !== ''){
        reservationMethod = 'PUT';
        reservationPath = "/"+rsId;
      } else reservationMethod = 'POST';
      
      if(srsId !== ''){
        scheduledRangeSupervisionMethod = 'PUT';
        scheduledRangeSupervisionPath = "/"+srsId;
      } else scheduledRangeSupervisionMethod = 'POST';

      console.log("PRE SEND",rsId==='',srsId==='');
      console.log("PRE SEND",rsId,srsId);
      console.log("PRE SEND",reservationMethod,scheduledRangeSupervisionMethod);
      
      let params = {
        range_id: this.state.range_id, 
        date: moment(date).format(), 
        available: true //TODO add button for availability?
      };
      console.log("params",params)      
      
      //reservation
      fetch("/api/reservation"+reservationPath, {
        method: reservationMethod,
        body: JSON.stringify(params),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => {
        //reservation can result in a duplicate which causes http 500 
        //error: duplicate key value violates unique constraint "range_reservation_range_id_date_unique"
        console.log("response",res);
        //400 and so on
        if(res.status.toString().startsWith(2) !== true){
          return reject(new Error('update reservation failed'));
        }
        if(res.status !== 204){ //no content crashes json parse so skip it
          return res.json();
        }
      })
      .then(json => {
        console.log("reservation success",json);
        if(typeof rsId !== 'number' && json !== undefined){
          console.log("rsId grabbed from result")
          rsId = json.id;
        }
        console.log(rsId,(typeof rsId !== 'number'),typeof rsId)
        if(typeof rsId !== 'number'){
          return reject(new Error('no reservation id in schedule'));
        }
        
        let params = {
          range_reservation_id: rsId,
          open: moment(this.state.start).format('HH:mm'), 
          close: moment(this.state.end).format('HH:mm'),
          supervisor_id: null
        };
        console.log("user",this.state.rangeOfficerSwitch === true, this.state.rangeOfficerId !== '')
        if(this.state.rangeOfficerSwitch === true){
          if(this.state.rangeOfficerId !== ''){
            params = {
              ...params,
              supervisor_id: this.state.rangeOfficerId
            };
          }
          else return reject(new Error('Range officer enabled but no id'));
        }
        console.log("params",params)
        
        //scheduled range supervision
        return fetch("/api/schedule"+scheduledRangeSupervisionPath, {
          method: scheduledRangeSupervisionMethod,
          body: JSON.stringify(params),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.state.token}`
          }
        })
        .then(res => {
          console.log("response",res);
          //400 and so on
          if(res.status.toString().startsWith(2) !== true){
            return reject(new Error('update schedule failed'));
          }
          if(res.status !== 204){ //no content crashes json parse so skip it
            return res.json();
          }
        })
        .then(json => {
          console.log("sched success",json);
          if(typeof srsId !== 'number' && json !== undefined){
            console.log("srsId grabbed from result")
            srsId = json.id;
            //update tracks for new
            this.getTracksupervision(srsId).then((res)=>{
              console.log("GTS",res,this.state.existingTracks);
              this.saveTrackSupervision(srsId).then((res) => {
                console.log("track supervision",res);
                this.update(true);
              },
              (error) => {
                return reject(new Error("track supervision error 1"));
              });
            },
            (error) => {
              return reject(new Error("track supervision error 2"));
            });
          }
          else {
            console.log(srsId,(typeof srsId !== 'number'),typeof srsId)
            if(typeof srsId !== 'number'){
              return reject(new Error('no schedule id in track supervision'));
            }
            this.saveTrackSupervision(srsId).then((res) => {
              console.log("track supervision",res);
              this.update(true);
            },
            (error) => {
              return reject(new Error("track supervision error 3"));
            });
          }
          
          return resolve("update success")
        });
      });
    })
  }

  async saveTrackSupervision(srsId){
    return new Promise((resolve,reject) => {

      //track supervision
      for (let key in this.state.tracks) {
        console.log("ts",key,this.state.tracks[key],this.state.existingTracks)
        let exists = false;
        for (let ekey in this.state.existingTracks) {
          if( this.state.tracks[key].id === this.state.existingTracks[ekey].track_id){
            exists = true;
          }
        }
        
        let supervisorStatus = this.state[this.state.tracks[key].id];
        let params = {
          track_supervisor: supervisorStatus
        };
        console.log("params",params,this.state.trackChanges)              
        
        let srsp = '';
        let trackSupervisionMethod = '';
        if(exists){
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
          console.log("POST PARAMS",params);
        }
        console.log("srsp",srsp,trackSupervisionMethod);
        
        fetch("/api/track-supervision"+srsp, {
          method: trackSupervisionMethod,
          body: JSON.stringify(params),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.state.token}`
          }
        })
        .then(res => {
          console.log("response",res);
          //400 and so on
          if(res.status.toString().startsWith(2) !== true){
            return reject(new Error('update track supervision failed'));
          }
          if(res.status !== 204){ //no content crashes json parse so skip it
            return res.json();
          }
        })
        .then(json => {
          console.log("track supervision "+this.state.tracks[key].name+" "+this.state.tracks[key].name+" success",json);
          //TODO up to date?
        });
      }
      return resolve("saveTrackSupervision");
    })
  }

  render() {
  
    const selectedDate = this.state.date;
    const handleDateChange = (date) => {
      this.setState({
        date: date
      });
    };
    
    const continueWithDate = (event) => {
      console.log("contwithdate",event);
      if(event.type !== undefined && event.type === 'submit'){
        event.preventDefault();
      }
      this.setState({
        state: 'loading'
      });
      this.update();
    }
    
    const selectedTimeStart = this.state.start;
    const handleTimeStartChange = (date) => {
      this.setState({
         start: date
      });
    };
   
    const selectedTimeEnd = this.state.end;
    const handleTimeEndChange = (date) => {
      this.setState({
         end: date
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
      let trackChanges = {
        ...this.state.trackChanges,
        [event.target.name]: event.target.value
      }
      
      this.setState({
        trackChanges: trackChanges,
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
    
    const saveChanges = (event) => {
      console.log("save")
      let date = moment(this.state.date).format('YYYY-MM-DD');
      updateRequirements(date)
      
      //repeat after me
      if(this.state.daily === true || 
         this.state.weekly === true || 
         this.state.monthly === true
      ){
        for (var i = 0; i < this.state.repeatCount; i++) {
          if(this.state.daily === true){
            date = moment(date).add(1, 'days');
            updateRequirements(date);
          }
          else if(this.state.weekly === true){
            date = moment(date).add(1, 'weeks');
            updateRequirements(date);
          }
          else if(this.state.monthly === true){
            date = moment(date).add(1, 'months');
            updateRequirements(date);
          }
        }
      }
    };
    
    const updateRequirements = (date) => {
      console.log("UPDATE REQUIREMENTS",date);
      let rsId = '';
      let srsId = '';
      
      //start spinner
      this.setState({
        state: 'loading'
      });
      
      this.getReservationInfo(date)
      .then((res)=>{
        console.log("GetReservationId",res);
        rsId = res !== undefined ? res : '';
        return this.getScheduleInfo(rsId);
      })
      .catch(error => {
        console.error('Rejected function called: ' + error.message);
      })
      .then((res2) => {
        console.log("GetScheduleId",res2,res2.scheduledRangeSupervisionId);
        srsId = res2.scheduledRangeSupervisionId !== undefined ? res2.scheduledRangeSupervisionId : '';
      
      })
      .catch(error => {
        console.error('Rejected function called: ' + error.message);
      })
      .then((res3) => {
        console.log("res3",res3);
        (async () => {
          const uc = await this.updateCall(date,rsId,srsId).then((res4) => {
            console.log("Gonna call update",res4,rsId,srsId);
            this.setState({
              state: 'ready',
              toast: true,
              toastMessage: "Päivitys onnistui",
              toastSeverity: "success"
            });
          },
          (error) => {
            console.log("Failed call update",error);
            console.error('Update rejection called: ' + error.message);
            if(error.message === 'Range officer enabled but no id'){
              this.setState({
                toastMessage: "Päävalvoja aktiivinen ilman valvojaa",
                toastSeverity: "warning",
                toast: true,
                state: 'ready'
              });
            }
            else{
              this.setState({
                toastMessage: "Päivitys epäonnistui",
                toastSeverity: "error",
                toast: true,
                state: 'ready'
              });
            }
          })
          console.log("uc",uc);
        })();

      })
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
    function RangeOfficerSelect (props) {
      let items = [];
      let disabled = false;
      
      for (var key in props.rangeOfficers) {
        items.push(
          <MenuItem key={key} value={props.rangeOfficers[key].id}>{props.rangeOfficers[key].name}</MenuItem>
        );
      }
      
      if (props.state.rangeOfficerSwitch === false) {
          console.log("range officer switch",props.state.rangeOfficerSwitch)
          disabled=true
      };

      return (
        <FormControl>
          <InputLabel id="chooseRangeOfficerLabel">Valitse valvoja</InputLabel>
          <Select
            {...disabled && {disabled: true}}
            labelId="chooseRangeOfficerLabel"
            name="rangeOfficerId"
            value={props.state.rangeOfficerId}
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
                onAccept={continueWithDate}
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
          <div className="bottomRow">
            <div className="roSwitch">
              Päävalvoja
              <Switch
                checked={this.state.rangeOfficerSwitch}
                onChange={handleSwitchChange}
                name="rangeOfficerSwitch"
              />
            </div>
            {/*Butchered state?*/}
            <RangeOfficerSelect 
              rangeOfficers={this.state.rangeOfficers}
              state={this.state} 
            />
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
              Toista 4 viikon välein
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