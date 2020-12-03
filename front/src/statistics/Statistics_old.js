import React, { useState, Component } from 'react';
import Chart from "react-apexcharts";
import '../App.css';
import './Statistics.css';

// Date management
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import Grid from '@material-ui/core/Grid';

// Utils
import { dayToString, getSchedulingDate } from '../utils/Utils';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import Button from '@material-ui/core/Button';


import axios from 'axios';

import '../App.css';

// Translation
import data from '../texts/texts.json';

let lang = 'fi'; // fallback
if (localStorage.getItem('language') === '0') {
  lang = 'fi';
} else if (localStorage.getItem('language') === '1') {
  lang = 'en';
}
moment.locale(lang);


/*
 ** Main function
 */

class Statistics extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        date: new Date(),
        visits: {},


        // feikkidataa kävijöistä kaavioiden demonstroimiseen
        options: {
          chart: {
            id: "charts"
          },
          xaxis: {
            name: "tracks",
            categories: [1, 2, 3, 4, 5, 6, 7]
          }
        },
        visitors: [
          {
            name: "visitors",
            data: [3, 6, 7, 4, 5, 4, 9]
          }
        ],
        shooters: [
          {
            name: "visitors",
            data: [12, 14, 19, 15, 13, 14, 17, 16, 13, 13, 14, 16, 17, 19, 17, 14]
          }
        ]
      };
    // required for "this" to work in callback
    // alternative way without binding in constructor:
    // public class fields syntax a.k.a. nextDayClick = (newObject) => {
    this.previousDayClick = this.previousDayClick.bind(this);
    this.nextDayClick = this.nextDayClick.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.setState({
        date: new Date(),
    })
    this.update();
    const firstDate = moment(this.state.date).startOf("month").format("YYYY-MM-DD");
    const lastDate = moment(this.state.date).endOf("month").format("YYYY-MM-DD");
    console.log(firstDate, lastDate);
    const visitors = getVisitors(firstDate, lastDate);
    this.setState({
      monthVisitors: {
        chart: {
          id: "charts"
        },
        xaxis: {
          name: "date",
          categories: visitors
        }
      }
    })
  }

  componentWillReceiveProps() { // eslint-disable-line
    this.setState({
      state: 'loading',
    }, () => {
      this.update();
    });
  }

  update() {
    // const kavijat = getVisitors();
    const { date } = this.props.match.params; // eslint-disable-line
    const request = async () => {
      const response = await getSchedulingDate(date);

      if (response !== false) {
        // console.log("Results from api",response);

        this.setState({
          state: 'ready',
          date: new Date(response.date),
          visits: response.tracks,
        });
      } else console.error('getting info failed');
      // console.log(this.state)
    };
    request();
  }

  previousDayClick(e) {
    e.preventDefault();
    const date = new Date(this.state.date.setDate(this.state.date.getDate() - 1)); // eslint-disable-line
    const dateFormatted = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    this.props.history.replace(`/statistics/${dateFormatted}`); // eslint-disable-line
    this.setState(
      {
        state: 'loading',
        date,
      },
      function () {
        this.update();
      },
    );
  }

  nextDayClick(e) {
    e.preventDefault();
    const date = new Date(this.state.date.setDate(this.state.date.getDate() + 1)); // eslint-disable-line
    const dateFormatted = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    this.props.history.replace(`/statistics/${dateFormatted}`); // eslint-disable-line
    this.setState(
      {
        state: 'loading',
        date,
      },
      function () {
        this.update();
      },
    );
  }

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
        console.log("TIME IS",this.state.date);
        this.update();
      });
    }
    
    render() {
      if (!this.state.date) {
          return <div></div>;
      }
      const { sched } = data;
      const fin = localStorage.getItem('language');

      return (
        <div className="container">
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

          {/* Header with arrows */}
          <Grid class="date-header">
            <div
              className="hoverHand arrow-left"
              onClick={this.previousDayClick}
            />
            <h1 className="headerText">
              {this.state.date.toLocaleDateString('fi-FI')}
            </h1>
            <div
              className="hoverHand arrow-right"
              onClick={this.nextDayClick}
            />
          </Grid>
          {/* Charts */}
          <div className="row">
            <div className="mixed-chart">
                <h2>Tämä päivä</h2>
                <h4>Kävijöitä yhteensä&nbsp;&nbsp; {this.state.date.toLocaleDateString('fi-FI')}: 34</h4>
                <div classname="bar">
                    <Chart
                        options={this.state.options}
                        series={this.state.visitors}
                        type="bar"
                        width="600"
                    />
                </div>
                <h2>Tämä kuukausi</h2>
                <h4>Kävijät yhteensä 11/2020: 226</h4>
                <div className="line">
                    <Chart
                        options={this.state.monthVisitors}
                        series={this.state.shooters}
                        type="line"
                        width="600"
                    />
                </div>
            </div>
          </div>
        </div>
      );
    }
  }

async function getVisitors(firstDate, lastDate) {
  
  const query = `api/daterange/freeform/${firstDate}/${lastDate}`;
  const response = await axios.get(query) // eslint-disable-line
    .then(async(response) => { // eslint-disable-line
      if (response) {
        let visitors = [];
        response.data.forEach(supervision => {
          console.log(supervision);
          if (!supervision?.scheduleId) {
            visitors = visitors.concat(0)
          } else {
            let trackVisitors = 0;
            supervision.tracks.forEach (track => {
              trackVisitors += track.scheduled.visitors;
            })
            visitors = visitors.concat(trackVisitors);
          }
        });
        console.log(visitors);
        return visitors;
      }
    })
    .catch((error) => { // eslint-disable-line
        console.log(error);
    });
    return null;

}

export default Statistics;