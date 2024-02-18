import React, { Component } from 'react';
import classNames from 'classnames';

// Material UI components
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Moment for date management
import moment from 'moment';
import api from '../api/api';
import {
  getSchedulingWeek,
  viewChanger,
  jumpToCurrent,
  getLanguage,
} from '../utils/Utils';
import exclamation from '../logo/Info.png';
import Infoboxes from '../infoboxes/Infoboxes';
import InfoBox from '../infoBox/InfoBox';
// Translation
import texts from '../texts/texts.json';
import css from './Weekview.module.scss';

const classes = classNames.bind(css);

const { weekdayShorthand, week } = texts;
const fin = localStorage.getItem('language');
const lang = getLanguage();

class Weekview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'loading',
      date: new Date(Date.now()),
      weekNro: 0,
      dayNro: 0,
      yearNro: 0,
    };
    this.previousWeekClick = this.previousWeekClick.bind(this);
    this.nextWeekClick = this.nextWeekClick.bind(this);
    this.update = this.update.bind(this);
  }

  // Updates week to current when page loads
  componentDidMount() {
    this.getWeek();
    this.getYear();
    this.update();
  }

  // Re-renders the component and fetches new data when the logo to frontpage is clicked on weekview
  /* eslint-disable-next-line */
  UNSAFE_componentWillReceiveProps() {
    this.setState(
      {
        state: 'loading',
      },
      () => {
        this.getWeek();
        this.getYear();
        this.update();
      },
    );
  }

  // Changes week number state to previous one
  previousWeekClick = (e) => {
    this.setState({
      state: 'loading',
    });

    e.preventDefault();

    let newDay;

    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1];
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );

      newDay = moment(paramDateCorrect, 'YYYYMMDD');
    } catch {
      newDay = moment(this.state.dayNro, 'YYYYMMDD');
    }

    newDay.subtract(1, 'week');

    const newWeek = newDay.week();

    try {
      const correctDay = new Date(
        this.state.date.setDate(this.state.date.getDate() - 7),
      );
      this.props.history.replace(
        `/weekview/${moment(newDay, 'YYYYMMDD')
          .add(1, 'day')
          .toISOString()
          .substring(0, 10)}`,
      );

      const weekNumber = moment(this.state.dayNro, 'YYYYMMDD').week();

      // Week logic cuz you can't go negative
      const newYear =
        weekNumber === 1 ? this.state.yearNro - 1 : this.state.yearNro;

      this.setState(
        {
          date: correctDay,
          dayNro: newDay,
          weekNro: newWeek,
          yearNro: newYear,
        },
        function () {
          this.update();
        },
      );
    } catch (error) {
      // console.log(error)
    }
  };

  // Changes week number state to next one
  nextWeekClick = (e) => {
    this.setState({
      state: 'loading',
    });

    e.preventDefault();

    let newDay;

    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1];
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );

      newDay = moment(paramDateCorrect, 'YYYYMMDD');
    } catch {
      newDay = moment(this.state.dayNro, 'YYYYMMDD');
    }

    newDay.add(1, 'week');
    const newWeek = newDay.week();

    try {
      const correctDay = new Date(
        this.state.date.setDate(this.state.date.getDate() + 7),
      );
      this.props.history.replace(
        `/weekview/${moment(newDay, 'YYYYMMDD')
          .add(1, 'day')
          .toISOString()
          .substring(0, 10)}`,
      );

      // Week logic cuz there's no 53 weeks
      const newYear =
        newWeek === 1 ? this.state.yearNro + 1 : this.state.yearNro;

      this.setState(
        {
          date: correctDay,
          dayNro: newDay,
          weekNro: newWeek,
          yearNro: newYear,
        },
        function () {
          this.update();
        },
      );
    } catch (error) {
      // console.log(error)
    }
  };

  // Function for parsing current week number
  getWeek = () => {
    const date1 = new Date();
    date1.setHours(0, 0, 0, 0);
    date1.setDate(date1.getDate() + 3 - ((date1.getDay() + 6) % 7)); // eslint-disable-line
    const week1 = new Date(date1.getFullYear(), 0, 4);
    const current =
      1 +
      Math.round(
        ((date1.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      ); // eslint-disable-line

    // Count correct weeknumber from URL
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');
      const weeknumber = moment(urlParamDate, 'YYYYMMDD').week();

      const paramDay = urlParamDateSplit[2].split('T')[0];
      const paramMonth = urlParamDateSplit[1];
      const paramYear = urlParamDateSplit[0];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYY-MM-DD',
      );

      if (Number.isNaN(weeknumber)) {
        // eslint-disable-line
        this.setState({ weekNro: current });
        this.props.history.replace('/weekview/');
      } else {
        this.setState({ weekNro: weeknumber, date: paramDateCorrect });
      }
    } catch {
      this.setState({ weekNro: current });
      this.props.history.replace('/weekview/');
    }

    return current;
  };

  // Creates 7 columns for days
  createWeekDay = () => {
    const table = [];
    let correctDay;
    let linkki;
    let dayNumber;

    if (this.state.paivat === undefined) {
      return;
    }

    for (let j = 0; j < 7; j += 1) {
      correctDay = this.state.paivat[j].date;
      linkki = `/dayview/${correctDay}`;

      dayNumber = j.toString();

      table.push(
        <Link key={dayNumber} className="link" to={linkki}>
          <p id="weekDay">
            {lang === 'en'
              ? weekdayShorthand[dayNumber][1]
              : lang === 'swe' 
              ? weekdayShorthand[dayNumber][2]
              : weekdayShorthand[dayNumber][0]}
          </p>
        </Link>,
      );
    }

    return table; // eslint-disable-line
  };

  // Creates 7 columns for days
  createDate = () => {
    const table = [];

    if (this.state.paivat === undefined) {
      return;
    }

    let oikeePaiva;
    let fixed;
    let newDate;
    let linkki;

    for (let j = 0; j < 7; j += 1) {
      oikeePaiva = this.state.paivat[j].date;
      fixed = oikeePaiva.split('-');
      newDate = `${fixed[2]}.${fixed[1]}.`;

      linkki = `/dayview/${oikeePaiva}`;
      table.push(
        <Link key={j} className="link" to={linkki}>
          <p style={{ fontSize: 'medium' }}>{newDate}</p>
        </Link>,
      );
    }

    return table; // eslint-disable-line
  };

  // Creates 7 columns for päävalvoja info, colored boxes
  createColorInfo = () => {
    // If color blue, something is wrong
    let colorFromBackEnd = 'blue';
    const table = [];

    if (this.state.paivat === undefined) {
      return;
    }

    let rataStatus;
    let oikeePaiva;
    let linkki;
    let info;

    for (let j = 0; j < 7; j += 1) {
      // Set color
      rataStatus = this.state.paivat[j].rangeSupervision;

      if (rataStatus === 'present') {
        colorFromBackEnd = '#658f60';
      } else if (rataStatus === 'confirmed') {
        colorFromBackEnd = '#b2d9ad';
      } else if (rataStatus === 'not confirmed') {
        colorFromBackEnd = '#95d5db';
      } else if (rataStatus === 'en route') {
        colorFromBackEnd = '#f2c66d';
      } else if (rataStatus === 'closed') {
        colorFromBackEnd = '#c97b7b';
      } else if (rataStatus === 'absent') {
        colorFromBackEnd = '#f2f2f2';
      }

      oikeePaiva = this.state.paivat[j].date;
      info = false;
      if (this.state.paivat[j].tracks) {
        // eslint-disable-next-line
        this.state.paivat[j].tracks.forEach((track) => {
          if (track.notice !== null && track.notice !== '') {
            info = true;
          }
        });
      }
      linkki = `/dayview/${oikeePaiva}`;
      table.push(
        <Link
          key={j}
          style={{ backgroundColor: `${colorFromBackEnd}` }}
          className="link"
          to={linkki}
        >
          <p>
            {info ? (
              <img
                className={classes(css.exclamation2)}
                src={exclamation}
                alt={week.Notice[fin]}
              />
            ) : (
              <br />
            )}
          </p>
        </Link>,
      );
    }
    return table; // eslint-disable-line
  };

  getYear = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    this.setState({ yearNro: yyyy });
    return yyyy;
  };

  update() {
    const { date } = this.state;
    const requestSchedulingDate = async () => {
      try {
        const data = await api.getSchedulingDate(date);
        this.setState({
          date: new Date(data.date),
        });
      } catch (err) {
        console.error('getting info failed');
      }
    };

    requestSchedulingDate();

    let testi2;
    if (this.state.dayNro === 0) {
      let today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();

      today = `${yyyy}-${mm}-${dd}`;

      const testi = moment(yyyy + mm + dd, 'YYYYMMDD');

      this.setState({
        dayNro: testi,
      });

      testi2 = testi.format('YYYY-MM-DD');
    } else {
      testi2 = this.state.dayNro.format('YYYY-MM-DD');
    }

    let date1 = testi2;

    const date2 = new Date();
    date2.setHours(0, 0, 0, 0);
    date2.setDate(date2.getDate() + 3 - ((date2.getDay() + 6) % 7)); // eslint-disable-line
    const week1 = new Date(date2.getFullYear(), 0, 4);
    const current =
      1 +
      Math.round(
        ((date2.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      ); // eslint-disable-line

    // Count correct weeknumber from URL
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const weeknumber = moment(urlParamDate, 'YYYYMMDD').week();

      const paramDay = urlParamDateSplit[2];
      const paramMonth = urlParamDateSplit[1];
      const paramYear = urlParamDateSplit[0];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      ).toDate();
      if (Number.isNaN(weeknumber)) {
        // eslint-disable-line
        this.setState({ weekNro: current });
        const now = moment().format();
        this.props.history.replace(`/weekview/${now.substring(0, 10)}`);
      } else {
        this.setState(
          { weekNro: weeknumber, date: paramDateCorrect, yearNro: paramYear },
          () => {},
        );

        date1 = paramDateCorrect;
      }
    } catch {
      this.setState({ weekNro: current });
      this.props.history.replace('/weekview/');
    }

    const requestSchedulingWeek = async () => {
      const response = await getSchedulingWeek(date1);

      if (response) {
        this.setState({
          paivat: response.week,
          state: 'ready',
        });
      } else console.error('getting info failed');
    };

    requestSchedulingWeek();
  }

  render() {
    const fin = localStorage.getItem('language'); // eslint-disable-line
    const { week } = texts; // eslint-disable-line
    return (
      <div>
        <InfoBox />
        <div className={classes(css.container)}>
          <Grid className={classes(css.dateHeader)}>
            <div
              className={classes(css.hoverHand, css.arrowLeft)}
              onClick={this.previousWeekClick}
            />
            <h1 className={classes(css.dateHeaderText)}>
              {' '}
              {`${week.Week[fin]} ${this.state.weekNro}, ${this.state.yearNro}`}
            </h1>
            {/* Month if needed: {monthToString(date.getMonth())} */}
            <div
              className={classes(css.hoverHand, css.arrowRight)}
              onClick={this.nextWeekClick}
            />
          </Grid>
          <div className={classes(css.bigContainer)}>
            <div className={classes(css.viewChanger)}>
              <div className={classes(css.viewChangerCurrent)}>
                {jumpToCurrent()}
              </div>
              <div className={classes(css.viewChangerContainer)}>
                {viewChanger()}
              </div>
            </div>

            {/* Date boxes */}
            <Grid className={classes(css.flexContainer2)}>
              {this.createWeekDay()}
            </Grid>

            {/* Date boxes */}
            <Grid className={classes(css.flexContainer2)}>
              {this.state.state !== 'ready' ? '' : this.createDate()}
            </Grid>

            {/* Colored boxes for dates */}
            {this.state.state !== 'ready' ? (
              <div className={classes(css.progress)}>
                <CircularProgress disableShrink />
              </div>
            ) : (
              <Grid className={classes(css.flexContainer)}>
                {this.createColorInfo()}
              </Grid>
            )}
          </div>
        </div>

        {/* Infoboxes */}
        <Infoboxes />
      </div>
    );
  }
}

export default Weekview;
