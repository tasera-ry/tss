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

class Scheduling extends Component {

    constructor(props) {
        super(props);
        this.state = {
          date: new Date('2014-08-18T21:11:54')
        };
    }

    render() {
    
      const selectedDate = this.state.date;
      const handleDateChange = (date) => {
        this.setState({
           date: date
        });
      };

      return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <KeyboardDatePicker
            margin="normal"
            id="date-picker"
            label="Päivämäärä"
            clearable
            value={selectedDate}
            onChange={date => handleDateChange(date)}
            format="DD.MM.YYYY"
          />
          <KeyboardTimePicker
            margin="normal"
            id="time-picker"
            label="Kellonaika"
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
          />

        </MuiPickersUtilsProvider>
      );
    }
}

export default Scheduling;