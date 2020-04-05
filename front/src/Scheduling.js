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
          rangeOfficerId: '',
          daily:false,
          weekly:false,
          monthly:false,
          repeatCount:'',
          token:'SECRET-TOKEN',
          reservationId:0,
          range_id: ''
        };
    }
    
    componentDidMount(){
      console.log("MOUNTED")
      this.getTracks()
      this.getRangeOfficers()
      this.getReservation()
    }
    
    update(){
      console.log("update",this.state.rangeOfficerId,this.state.start,this.state.end);
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
        let rsId = 0;
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
        let rangeOfficerId = 0;
        let start = 0;
        let end = 0;
        if(json.length > 0){
          console.log("resid",json[0].supervisor_id,start)
          rangeOfficerId = json[0].supervisor_id; //is this even the correct id? links to supervisor table which links to user table
          start = moment(json[0].open, 'h:mm:ss').format();
          end = moment(json[0].close, 'h:mm:ss').format();
          console.log("resid",rangeOfficerId,start,end)
        }
        this.setState({
          rangeOfficerId:rangeOfficerId,
          start: start,
          end: end
        },
        function() {
          this.update()
        })
      });
    }

    render() {
    
      const selectedDate = this.state.date;
      const handleDateChange = (date) => {
        this.update();
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
      
      const openAllTracks = (event) => {        
        console.log("Open tracks");
        for (var key in this.state.tracks) {
          this.setState({
             [this.state.tracks[key].id]: true
          });
        }
      };
      
      const closeAllTracks = (event) => {
        console.log("Close tracks");
        for (var key in this.state.tracks) {
          this.setState({
             [this.state.tracks[key].id]: false
          });
        }
      };
      
      const saveChanges = (event) => {
        //TODO
        console.log("save")
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
              <Button variant="contained" color="primary" onClick={openAllTracks}>Kaikki auki</Button>
              <Button variant="contained" color="secondary" onClick={closeAllTracks}>Kaikki kiinni</Button>
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