import React, { Component } from 'react';

import '../App.css';
import './Monthview.css';

// Material UI components
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

// Moment for date management
import moment from 'moment';
import { getSchedulingDate } from '../utils/Utils';
import exclamation from '../logo/Info.png';

// Translation
import texts from '../texts/texts.json';

const { weekdayShorthand } = texts;  // eslint-disable-line
const { month } = texts;
const fin = localStorage.getItem('language');

class Monthview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'loading',
      date: new Date(Date.now()),
      yearNro: 0,
      monthNro: 0,
    };

    this.previousMonthClick = this.previousMonthClick.bind(this);
    this.nextMonthClick = this.nextMonthClick.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    // poistetaan, kun tiedot tulee muualta
    this.getYear();
    this.getMonth();
  }



  previousMonthClick(e) {
    e.preventDefault();
    const date = new Date(this.state.date.setMonth(this.state.date.getMonth() - 1)); // eslint-disable-line
    let dateFormatted = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    this.props.history.replace(`/Monthview/${dateFormatted}`); // eslint-disable-line
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    this.setState(
      {
        date: date,
        yearNro: year,
        monthNro: month,
      },
      function() {
        this.update();
      }
    );
  }

  nextMonthClick(e) {
    e.preventDefault();
    const date = new Date(this.state.date.setMonth(this.state.date.getMonth() + 1)); // eslint-disable-line
    let dateFormatted = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    this.props.history.replace(`/Monthview/${dateFormatted}`); // eslint-disable-line
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    this.setState(
      {
        date: date,
        yearNro: year,
        monthNro: month,
      },
      function() {
        this.update();
      }
    );
  }

  update() {

  }

  getYear = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    this.setState({ yearNro: yyyy });
    return yyyy;
  }

  getMonth = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    this.setState({ monthNro: mm });
    return mm;
  }

  createWeekDay = () => {
    const table = [];
    let dayNumber;

    for (let j = 0; j < 8; j += 1) {
      dayNumber = j.toString();

        if (dayNumber === '0'){
          table.push(
            <div className="weekNumber">
            {month["weekNumber"][fin]}
            </div>
            )
        }
        else {
          table.push(
            <div>
            {weekdayShorthand[dayNumber-1][fin]}
            </div>
            )
        }

    }

    return table; // eslint-disable-line
  }

  createMonthTable = () => {
    const table = [];

    if (this.state.yearNro == "0") {
      return;
    }

    let days = moment(this.state.yearNro + "-" + this.state.monthNro, "YYYY-MM").daysInMonth()
    let startDay = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + "1", "YYYY-MM-DD")
    let firstMon = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + "1", "YYYY-MM-DD")

    while (firstMon.format('ddd') !== "Mon"){
      firstMon = firstMon.subtract(1, "days");
    }

    // Tarkistetaan ensimmäinen maanantai ja lisätään siitä päivät
    while (firstMon.format('ddd') !== startDay.format('ddd')){
      table.push(
        <Link class="link notCurMonth" to={"/dayview/" + firstMon.format("YYYY-MM-DD")}>
          <div>
            {firstMon.date()}
          </div>
        </Link>
      )
      firstMon.add(1, 'days');
    }

    // lisätään kuukauteen kuuluvat päivät
    while (startDay.format('D') < days){
      table.push(
        <Link class="link" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
          <div>
            {startDay.date()}
          </div>
        </Link>
        )
      startDay.add(1, 'days');
    }

    table.push(
      <Link class="link" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
        <div>
          {startDay.date()}
        </div>
      </Link>
    )
    startDay.add(1, 'days');

    // Lisätään viimeiseen viikkoon kuuluvat päivät
    while (startDay.format('ddd') !== "Sun"){
      table.push(
        <Link class="link notCurMonth" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
          <div>
            {startDay.date()}
          </div>
        </Link>
        )
      startDay.add(1, 'days');
    }

    // lisätään viimeinen päivä, joka jää while loopin takia 
    table.push(
      <Link class="link notCurMonth" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
        <div>
          {startDay.date()}
        </div>
      </Link>
    )

    return table;
  }

  createWeekNumber = () => {
    const table = [];
    let days = moment(this.state.yearNro + "-" + this.state.monthNro, "YYYY-MM").daysInMonth()
    let startWeek = moment(this.state.yearNro + "-" + this.state.monthNro + "-1", "YYYY-MM-DD").isoWeek()
    let apuAlku = moment(this.state.yearNro + "-" + this.state.monthNro + "-1", "YYYY-MM-DD")
    let endWeek = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + days, "YYYY-MM-DD").isoWeek()
    let link = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + "1", "YYYY-MM-DD")

    if (this.state.yearNro == "0") {
      return;
    }

    while (apuAlku.isoWeek() !== endWeek) {
      table.push(
        <Link class="link" to={"/weekview/" + link.format("YYYY-MM-DD")}>
          <div>
            {startWeek}
          </div>
        </Link>
      );
      link.add(1, 'weeks');
      apuAlku.add(1, 'weeks');
      startWeek = apuAlku.isoWeek();
      
    }

    table.push(
        <Link class="link" to={"/weekview/" + link.format("YYYY-MM-DD")}>
          <div>
            {startWeek}
          </div>
        </Link>
    )

    return table;
  }

  render() {
    const fin = localStorage.getItem('language'); // eslint-disable-line
    const { weekdayShorthand } = texts;  // eslint-disable-line
    const { month } = texts;  // eslint-disable-line
    return (
      <div>
        <div className="date-header">
            <div
              className="hoverHand arrow-left"
              onClick={this.previousMonthClick}
            />
            <h1>
              {month.[this.state.monthNro][fin]}, {this.state.yearNro}
            </h1>
            <div
              className="hoverHand arrow-right"
              onClick={this.nextMonthClick}
            />
          </div>

          <div className="month-container">
            <div className="weekdays">
              {this.createWeekDay()}
            </div>
            <div className="weekNumber">
              {this.createWeekNumber()}
            </div>
            <div className="month-days">
              {this.createMonthTable()}
            </div>
          </div>
      </div>
      )
  }
}

export default Monthview;