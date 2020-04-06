import React, { Component } from "react";
import './App.css';
import './Scheduling.css'
import Grid from '@material-ui/core/Grid';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Switch from '@material-ui/core/Switch';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import moment from 'moment';

class Scheduling extends Component {

    constructor(props) {
        super(props);
        this.state = {
          date: new Date(),
          start: new Date(),
          end: new Date(),
          rangeOfficerSwitch: false,
          rangeOfficerId: null,
          daily:false,
          weekly:false,
          monthly:false,
          repeatCount:'',
          token:'SECRET-TOKEN',
          reservationId:null,
          scheduledRangeSupervisionId:null,
          range_id: null
        };
    }
    
    componentDidMount(){
      console.log("MOUNTED");
      this.getTracks();
      this.getRangeOfficers();
      this.update();
    }
    
    update(){
      console.log("update",this.state.rangeOfficerId,this.state.start,this.state.end);
      this.getReservation();
    }
    
    getTracks(){
      fetch("/api/track", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
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
      fetch("/api/reservation?date="+moment(this.state.date).format('YYYY-MM-DD'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        console.log("RESERVATION",json)
        let rsId = null;
        if(json.length > 0){
          rsId = json[0].id
        }
        this.setState({
          reservationId:rsId
        },
        function() {
          this.getSchedule();
        })
      });
    }
    
    getSchedule(){
      fetch("/api/schedule?range_reservation_id="+this.state.reservationId, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        console.log("reservationid",this.state.reservationId)
        console.log("SCHEDULE",json)
        let rangeOfficerId = null;
        let start = 0;
        let end = 0;
        let rangeOfficerSwitch = false;
        let scheduledRangeSupervisionId = null;
        if(json.length > 0){
          console.log("resid",json[0].supervisor_id,start)
          rangeOfficerId = json[0].supervisor_id; //is this even the correct id? links to supervisor table which links to user table
          start = moment(json[0].open, 'h:mm:ss').format();
          end = moment(json[0].close, 'h:mm:ss').format();
          rangeOfficerSwitch = json[0].supervisor_id !== null ? true : false;
          scheduledRangeSupervisionId = json[0].id;
          console.log("resid",rangeOfficerId,start,end)
        }
        this.setState({
          rangeOfficerSwitch: rangeOfficerSwitch,
          rangeOfficerId:rangeOfficerId,
          start: start,
          end: end,
          scheduledRangeSupervisionId: scheduledRangeSupervisionId
        },
        function() {
          this.getTracksupervision();
        })
      });
    }

    getTracksupervision(){
      fetch("/api/track-supervision?scheduled_range_supervision_id="+this.state.scheduledRangeSupervisionId, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        console.log("scheduledRangeSupervisionId",this.state.scheduledRangeSupervisionId)
        console.log("TRACK SUPERVISION",json)
        
        //clarifies whether to use post or put later
        this.setState({
          existingTracks: json
        });

        //lovely bubble sort speeds
        //sets tracks that have supervisor present to active
        this.closeAllTracks();
        for (var key in this.state.tracks) {
          for (var jkey in json) {
            //console.log(key,jkey,this.state.tracks[key].id,json[jkey].track_id)
            if(this.state.tracks[key].id === json[jkey].track_id){
              console.log("match",key,jkey,this.state.tracks[key].id,json[jkey].track_id);
              if(json[jkey].track_supervisor === 'present'){
                this.setState({
                  [this.state.tracks[key].id]: true
                });
              }
            }
          }
        }
        
      });
    }
    
    openAllTracks = (event) => {        
      console.log("Open tracks");
      for (var key in this.state.tracks) {
        this.setState({
           [this.state.tracks[key].id]: true
        });
      }
    };
    
    closeAllTracks = (event) => {
      console.log("Close tracks");
      for (var key in this.state.tracks) {
        this.setState({
           [this.state.tracks[key].id]: false
        });
      }
    };

    render() {
    
      const selectedDate = this.state.date;
      const handleDateChange = (date) => {
        this.setState({
           date: date
        },
        function() {
          this.update()
        });
      };
      
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
      
      const handleValueChange = (event) => {
        console.log("Value change",event.target.name, event.target.value)
        this.setState({
           [event.target.name]: event.target.value
        });
      };
      
      const saveChanges = (event) => {
        console.log("save")
        
        let reservationMethod;
        let scheduledRangeSupervisionMethod;
        let trackSupervisionMethod;
        let reservationPath = "";
        let scheduledRangeSupervisionPath = "";
        let trackSupervisionPath = "";
        
        //determine exist or not with:
        //reservationId:null,
        //scheduledRangeSupervisionId:null,
        //trackSupervisionId:null,
        if(this.state.reservationId !== null){
          reservationMethod = 'PUT';
          reservationPath = "/"+this.state.reservationId;
        } else reservationMethod = 'POST';
        
        if(this.state.scheduledRangeSupervisionId !== null){
          scheduledRangeSupervisionMethod = 'PUT';
          scheduledRangeSupervisionPath = "/"+this.state.scheduledRangeSupervisionId;
        } else scheduledRangeSupervisionMethod = 'POST';

        console.log("PRE SEND",this.state.reservationId,this.state.scheduledRangeSupervisionId);
        console.log("PRE SEND",reservationMethod,scheduledRangeSupervisionMethod);
        
        let params = {
          range_id: this.state.range_id, 
          date: moment(this.state.date).format('YYYY-MM-DD'), 
          available: this.state.rangeOfficerSwitch //did available mean range officer?
        };
        console.log("params",params)        
        
        //reservation
        fetch("/api/reservation"+reservationPath, {
          method: reservationMethod,
          body: new URLSearchParams(params),
          headers: {
            Authorization: `Bearer ${this.state.token}`
          }
        })
        .then(res => {
          //reservation can result in a duplicate which causes http 500 
          //error: duplicate key value violates unique constraint "range_reservation_range_id_date_unique"
          console.log("response",res);
          if(res.status !== 204){ //no content crashes json parse so skip it
            res.json()
          }
        })
        .then(json => {
          console.log("reservation success",json);
          
          let params = {
            reservation_id: this.state.reservationId,
            open: moment(this.state.start).format('HH:mm'), 
            close: moment(this.state.end).format('HH:mm')
          };
          /*
          this.state.rangeOfficerId, 
          this being null causes error: invalid input syntax for integer: "null"
          [0]     at Connection.parseE (C:\Users\JH\Documents\tasera\TSS\node_modules\pg\lib\connection.js:614:13)          
           */
          if(this.state.rangeOfficerId !== null){
            params = {
              ...params,
              supervisor_id: this.state.rangeOfficerId
            };
          }
          console.log("params",params)
          
          //scheduled range supervision
          fetch("/api/schedule"+scheduledRangeSupervisionPath, {
            method: scheduledRangeSupervisionMethod,
            body: new URLSearchParams(params),
            headers: {
              Authorization: `Bearer ${this.state.token}`
            }
          })
          .then(res => {
            console.log("response",res);
            if(res.status !== 204){ //no content crashes json parse so skip it
              res.json()
            }
          })
          .then(json => {
            console.log("schedule success",json);
            
            //track supervision
            for (var key in this.state.tracks) {
              
              let exists = false;
              for (var ekey in this.state.existingTracks) {
                if( this.state.tracks[key].id === this.state.existingTracks[ekey].track_id){
                  exists = true;
                }
              }
              
              let supervisorStatus = this.state[this.state.tracks[key].id] ? 'present' : 'absent';
              let params = {
                track_supervisor: supervisorStatus
              };
              console.log("params",params)              
              
              let srsp = '';
              if(exists){
                scheduledRangeSupervisionMethod = 'PUT';
                srsp = scheduledRangeSupervisionPath + '/' + this.state.tracks[key].id;
              } 
              else
              {
                scheduledRangeSupervisionMethod = 'POST';
                params = {
                  ...params,
                  scheduled_range_supervision_id:this.state.scheduledRangeSupervisionId,
                  track_id:this.state.tracks[key].id
                };
              }
              console.log("srsp",srsp,scheduledRangeSupervisionMethod);
              
              fetch("/api/track-supervision"+srsp, {
                method: scheduledRangeSupervisionMethod,
                body: new URLSearchParams(params),
                headers: {
                  Authorization: `Bearer ${this.state.token}`
                }
              })
              .then(res => {
                console.log("response",res);
                if(res.status !== 204){ //no content crashes json parse so skip it
                  res.json()
                }
              })
              .then(json => {
                console.log("track supervision "+this.state.tracks[key].name+" "+this.state.tracks[key].name+" success",json);
                //TODO up to date?
                
              });
            }
            
          });
        });
      };
      
      //builds tracklist
      function TrackList(props) {
        let items = [];
        for (var key in props.tracks) {
          items.push(
            <React.Fragment
            key={key}>
              {props.tracks[key].name}
              <Switch
                checked={ props.state[props.tracks[key].id] || false }
                onChange={handleSwitchChange}
                name={props.tracks[key].id}
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
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
        <div className="root">
          <div className="firstSection">
            <div className="topRow">
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  margin="normal"
                  name="date"
                  label="Valitse päivä"
                  clearable
                  value={selectedDate}
                  onChange={date => handleDateChange(date)}
                  format="DD.MM.YYYY"
                />
              </MuiPickersUtilsProvider>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardTimePicker
                  margin="normal"
                  name="start"
                  label="Alku"
                  value={selectedTimeStart}
                  onChange={handleTimeStartChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change time',
                  }}
                />
              </MuiPickersUtilsProvider>
              <div>-</div>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardTimePicker
                  margin="normal"
                  name="end"
                  label="Loppu"
                  value={selectedTimeEnd}
                  onChange={handleTimeEndChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change time',
                  }}
                />
              </MuiPickersUtilsProvider>
            </div>
            <div className="bottomRow">
              Päävalvoja
              <Switch
                checked={this.state.rangeOfficerSwitch}
                onChange={handleSwitchChange}
                name="rangeOfficerSwitch"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
              {/*Butchered state?*/}
              <RangeOfficerSelect 
                rangeOfficers={this.state.rangeOfficers}
                state={this.state} 
              />
            </div>
          </div>
          <hr/>
          <div className="secondSection">
            <div className="leftSide">
              {/*Butchered state?*/}
              <TrackList 
                tracks={this.state.tracks}
                state={this.state} 
              />
            </div>
            <div className="rightSide">
              <Button variant="contained" color="primary" onClick={this.openAllTracks}>Kaikki auki</Button>
              <Button variant="contained" color="secondary" onClick={this.closeAllTracks}>Kaikki kiinni</Button>
            </div>
          </div>
          <hr/>
          <div className="thirdSection">
            <div className="repetition">
              <div className="daily">
                Toista päivittäin
                <Switch
                  checked={ this.state.daily }
                  onChange={handleSwitchChange}
                  name='daily'
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              </div>
              <div className="weekly">
                Toista viikottain
                <Switch
                  checked={ this.state.weekly }
                  onChange={handleSwitchChange}
                  name='weekly'
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              </div>
              <div className="monthly">
                Toista 4 viikon välein
                <Switch
                  checked={ this.state.monthly }
                  onChange={handleSwitchChange}
                  name='monthly'
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              </div>
              <div className="repeatCount">
                Toistojen määrä
                <TextField 
                  name="repeatCount" 
                  type="number" 
                  value={this.state.repeatCount} 
                  onChange={handleValueChange}/>
              </div>
            </div>
            <div className="save">
              <Button variant="contained" onClick={saveChanges}>Tallenna muutokset</Button>
            </div>
          </div>
        </div>
        
      );
    }
}

export default Scheduling;