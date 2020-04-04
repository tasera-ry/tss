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

class Scheduling extends Component {

    constructor(props) {
        super(props);
        this.state = {
          date: new Date(),
          start: new Date(),
          end: new Date(),
          rangeOfficerSwitch: false,
          rangeOfficerId: ''
        };
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
      
      const handleRangeOfficerSwitchChange = (event) => {
        this.setState({
           [event.target.name]: event.target.checked
        });
      };
      
      const handleRangeOfficerSelectChange = (event) => {
        this.setState({
           rangeOfficerId: event.target.value
        });
      };

      return (
        <div className="root">
          <div className="firstSection">
            <div className="topRow">
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  margin="normal"
                  id="date-picker"
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
                  id="time-picker"
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
                  id="time-picker"
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
                onChange={handleRangeOfficerSwitchChange}
                name="rangeOfficerSwitch"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
              <FormControl>
                <InputLabel id="chooseRangeOfficerLabel">Valitse valvoja</InputLabel>
                <Select
                  labelId="chooseRangeOfficerLabel"
                  id="chooseRangeOfficer"
                  value={this.state.rangeOfficerId}
                  onChange={handleRangeOfficerSelectChange}
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
            </div>
            <div className="rightSide">

            </div>
          </div>
        </div>
        
      );
    }
}

export default Scheduling;