import React, { Component } from 'react';

import '../App.css';
import './Monthview.css';

// Material UI components
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

// Moment for date management
import moment from 'moment';
import { getSchedulingDate, viewChanger, getSchedulingFreeform, checkColor } from '../utils/Utils';
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
      yearNro: 2000,
      monthNro: "01",
    };

    this.previousMonthClick = this.previousMonthClick.bind(this);
    this.nextMonthClick = this.nextMonthClick.bind(this);
    this.update = this.update.bind(this)
  }

  componentDidMount() {

    this.update();
    this.getYear();
    this.getMonth();
  }

  update() {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, 'YYYYMMDD');
      paramDateCorrect.add(1, 'days');
      this.props.history.replace(`/Monthview/${paramDateCorrect.toISOString().substring(0, 10)}`); // eslint-disable-line
      this.setState({
        date: new Date(paramDateCorrect).toISOString(),
        monthNro: paramDateCorrect.format('MM'),
        yearNro: paramDateCorrect.format('YYYY'),
      });

    } catch {
      
    }
  }

  previousMonthClick(e) {
    e.preventDefault();
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, 'YYYYMMDD');
      paramDateCorrect.add(1, 'days');
      paramDateCorrect.subtract(1, 'month');
      this.props.history.replace(`/Monthview/${paramDateCorrect.toISOString().substring(0, 10)}`); // eslint-disable-line
      this.setState({
        date: new Date(paramDateCorrect).toISOString(),
        monthNro: paramDateCorrect.format('MM'),
        yearNro: paramDateCorrect.format('YYYY'),
      });

    } catch {

    }
  }

  nextMonthClick(e) {
    e.preventDefault();
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, 'YYYYMMDD');
      paramDateCorrect.add(1, 'days');
      paramDateCorrect.add(1, 'month');
      this.props.history.replace(`/Monthview/${paramDateCorrect.toISOString().substring(0, 10)}`); // eslint-disable-line
      this.setState({
        date: new Date(paramDateCorrect).toISOString(),
        monthNro: paramDateCorrect.format('MM'),
        yearNro: paramDateCorrect.format('YYYY'),
      });

    } catch {

    }
  }

  getYear = () => {
    try{
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      if (paramYear.length === 4){
        this.setState({ yearNro: paramYear });
        return paramYear;
      }
    }
    catch{
      console.log("Error getting year from url")
    }
      const today = new Date();
      const yyyy = today.getFullYear();
      this.setState({ yearNro: yyyy });
      return yyyy;
  }

  getMonth = () => {
    try{
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      if (paramMonth.length === 2){
        this.setState({ monthNro: paramMonth });
        return paramMonth;
      }
    }
    catch{
      console.log("Error getting month from url")
    }
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      this.setState({ monthNro: mm });
      return mm;
  }

  createWeekDay = () => {
    const table = [];
    let dayNumber;

    const fin = localStorage.getItem('language'); // eslint-disable-line
    const { weekdayShorthand } = texts;  // eslint-disable-line
    const { month } = texts;  // eslint-disable-line

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
    const requestSchedulingFreeform = async (date) => {
      const response = await getSchedulingFreeform(date);

      if (response) {
        this.setState({
          // Tässä tehään päivät ja tän mukaan tulee se mikä on eka päivä
          paivat: response.month,
          state: 'ready',
        });
      } else console.error('getting info failed');
    };

    const table = [];
    if (this.state.yearNro === 0) {
      return;
    }

    let apu = 0;
    let days = moment(this.state.yearNro + "-" + this.state.monthNro, "YYYY-MM").daysInMonth()
    let startDay = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + "1", "YYYY-MM-DD")
    let firstMon = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + "1", "YYYY-MM-DD")

    // safety loop incase of errors in name detection due to wrong locale, e.g. Sweden
    let safetyLoop = 0;

    while (firstMon.format('ddd') !== "Mon" && firstMon.format('ddd') !== "ma"){
      firstMon = firstMon.subtract(1, "days");
      if (safetyLoop > 7){
        break;
      }
      safetyLoop += 1;
    }
    safetyLoop = 0;

    if (this.state.paivat === undefined || this.state.paivat[0].date !== firstMon.format('YYYY-MM-DD')){
      requestSchedulingFreeform(firstMon.format('YYYY-MM-DD'));
    }
    if (this.state.paivat === undefined){
      return;
    }
    // Tarkistetaan ensimmäinen maanantai ja lisätään siitä päivät
    while (firstMon.format('ddd') !== startDay.format('ddd')){
      let colorFromBackEnd = checkColor(this.state.paivat, apu)
      apu += 1;
      table.push(
        <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link notCurMonth" to={"/dayview/" + firstMon.format("YYYY-MM-DD")}>
          <div>
            {firstMon.date()}
          </div>
        </Link>
      )
      firstMon.add(1, 'days');
    }

    // lisätään kuukauteen kuuluvat päivät.
    while (startDay.format('D') < days){
      let colorFromBackEnd = checkColor(this.state.paivat, apu)
      apu += 1;
      table.push(
        <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
          <div>
            {startDay.date()}
          </div>
        </Link>
        )
      startDay.add(1, 'days');
    }

    let colorFromBackEnd = checkColor(this.state.paivat, apu)
    apu += 1;
    table.push(
      <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
        <div>
          {startDay.date()}
        </div>
      </Link>
    )
    startDay.add(1, 'days');

    // Lisätään viimeiseen viikkoon kuuluvat päivät.
    while (startDay.format('ddd') !== "Mon" && startDay.format('ddd') !== "ma"){
      let colorFromBackEnd = checkColor(this.state.paivat, apu)
      apu += 1;
      table.push(
        <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link notCurMonth" to={"/dayview/" + startDay.format("YYYY-MM-DD")}>
          <div>
            {startDay.date()}
          </div>
        </Link>
        )
      startDay.add(1, 'days');
      if (safetyLoop > 7){
        break;
      }
    safetyLoop += 1;
    }

    return table;
  }

  createWeekNumber = () => {
    const table = [];
    let days = moment(this.state.yearNro + "-" + this.state.monthNro, "YYYY-MM").daysInMonth()
    let startWeek = moment(this.state.yearNro + "-" + this.state.monthNro + "-1", "YYYY-MM-DD").isoWeek()
    let apuAlku = moment(this.state.yearNro + "-" + this.state.monthNro + "-1", "YYYY-MM-DD")
    let endWeek = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + days, "YYYY-MM-DD").isoWeek()
    let link = moment(this.state.yearNro + "-" + this.state.monthNro + "-" + "1", "YYYY-MM-DD")

    if (this.state.yearNro === 0) {
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
            <div className="viewChanger">
              <div className="viewChanger-container">
                {viewChanger()}
              </div>
            </div>
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