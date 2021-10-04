import React, { Component } from 'react';
import '../App.css';
import './Weekview.css';

// Material UI components
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

// Moment for date management
import moment from 'moment';
import api from '../api/api';
import { getSchedulingWeek, viewChanger, jumpToCurrent } from '../utils/Utils';
import exclamation from '../logo/Info.png';
import Infoboxes from '../infoboxes/Infoboxes';

// Translation
import texts from '../texts/texts.json';

let lang = 'fi'; // fallback
if (localStorage.getItem('language') === '0') {
  lang = 'fi';
} else if (localStorage.getItem('language') === '1') {
  lang = 'en';
}

const { weekdayShorthand, week } = texts;
const fin = localStorage.getItem('language');

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

    let uusPaiva;

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

      uusPaiva = moment(paramDateCorrect, 'YYYYMMDD');
    } catch {
      uusPaiva = moment(this.state.dayNro, 'YYYYMMDD');
    }

    uusPaiva.subtract(1, 'week');

    const uusViikko = uusPaiva.week();

    try {
      const oikeePaiva = new Date(
        this.state.date.setDate(this.state.date.getDate() - 7),
      );
      this.props.history.replace(
        `/weekview/${moment(uusPaiva, 'YYYYMMDD')
          .add(1, 'day')
          .toISOString()
          .substring(0, 10)}`,
      );

      const viikkoNumero = moment(this.state.dayNro, 'YYYYMMDD').week();

      // Week logic cuz you can't go negative
      const uusVuosi =
        viikkoNumero === 1 ? this.state.yearNro - 1 : this.state.yearNro;

      this.setState(
        {
          date: oikeePaiva,
          dayNro: uusPaiva,
          weekNro: uusViikko,
          yearNro: uusVuosi,
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

    let uusPaiva;

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

      uusPaiva = moment(paramDateCorrect, 'YYYYMMDD');
    } catch {
      uusPaiva = moment(this.state.dayNro, 'YYYYMMDD');
    }

    uusPaiva.add(1, 'week');
    const uusViikko = uusPaiva.week();

    try {
      const oikeePaiva = new Date(
        this.state.date.setDate(this.state.date.getDate() + 7),
      );
      this.props.history.replace(
        `/weekview/${moment(uusPaiva, 'YYYYMMDD')
          .add(1, 'day')
          .toISOString()
          .substring(0, 10)}`,
      );

      // Week logic cuz there's no 53 weeks
      const uusVuosi =
        uusViikko === 1 ? this.state.yearNro + 1 : this.state.yearNro;

      this.setState(
        {
          date: oikeePaiva,
          dayNro: uusPaiva,
          weekNro: uusViikko,
          yearNro: uusVuosi,
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
    let oikeePaiva;
    let linkki;
    let dayNumber;

    if (this.state.paivat === undefined) {
      return;
    }

    for (let j = 0; j < 7; j += 1) {
      oikeePaiva = this.state.paivat[j].date;
      linkki = `/dayview/${oikeePaiva}`;

      dayNumber = j.toString();

      table.push(
        <Link key={dayNumber} className="link" to={linkki}>
          <p id="weekDay">
            {lang === 'en'
              ? weekdayShorthand[dayNumber][1]
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
      newDate = `${fixed[2]}.${fixed[1]}`;

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
        colorFromBackEnd = '#f2f0eb';
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
                className="exclamation-2"
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
        <div className="container">
          <Grid className="date-header">
            <div
              className="hoverHand arrow-left"
              onClick={this.previousWeekClick}
            />
            <h1 className="dateHeader-text">
              {' '}
              {`${week.Week[fin]} ${this.state.weekNro}, ${this.state.yearNro}`}
            </h1>
            {/* Month if needed: {monthToString(date.getMonth())} */}
            <div
              className="hoverHand arrow-right"
              onClick={this.nextWeekClick}
            />
          </Grid>
          <div className="big-container">
            <div className="viewChanger">
              <div className="viewChanger-current">{jumpToCurrent()}</div>
              <div className="viewChanger-container">{viewChanger()}</div>
            </div>

            {/* Date boxes */}
            <Grid className="flex-container2">{this.createWeekDay()}</Grid>

            {/* Date boxes */}
            <Grid className="flex-container2">
              {this.state.state !== 'ready' ? '' : this.createDate()}
            </Grid>

            {/* Colored boxes for dates */}
            {this.state.state !== 'ready' ? (
              <div className="progress">
                <CircularProgress disableShrink />
              </div>
            ) : (
              <Grid className="flex-container">{this.createColorInfo()}</Grid>
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
