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
          token:'SECRET-TOKEN'
        };
    }
    
    componentDidMount(){
      console.log("MOUNTED")
      fetch("/api/track", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.token}`
        }
      })
      .then(res => res.json())
      .then(json => {
        this.setState({
           tracks: json
        })
      });
    }

    render() {
    
      const selectedDate = this.state.date;
      const handleDateChange = (date) => {
        this.setState({
           date: date
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
              <Switch
                checked={this.state.rangeOfficerSwitch}
                onChange={handleSwitchChange}
                name="rangeOfficerSwitch"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
              <FormControl>
                <InputLabel id="chooseRangeOfficerLabel">Valitse valvoja</InputLabel>
                <Select
                  labelId="chooseRangeOfficerLabel"
                  name="rangeOfficerId"
                  value={this.state.rangeOfficerId}
                  onChange={handleValueChange}
                >
                  <MenuItem value={10}>Ro10</MenuItem>
                  <MenuItem value={20}>Ro20</MenuItem>
                  <MenuItem value={30}>Ro30</MenuItem>
                </Select>
              </FormControl>
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