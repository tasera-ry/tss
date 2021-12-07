import React, { Component } from 'react';
import classNames from 'classnames';

// Material UI components
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

// Moment for date management
import moment from 'moment';
import {
  viewChanger,
  jumpToCurrent,
  getSchedulingFreeform,
  checkColor,
} from '../utils/Utils';
import Infoboxes from '../infoboxes/Infoboxes';
// Translation
import texts from '../texts/texts.json';
import css from './Monthview.module.scss';

const classes = classNames.bind(css);

const smallInfoIcon = require('../logo/Small-info.png');

const { weekdayShorthand, month } = texts; // eslint-disable-line
const fin = localStorage.getItem('language');

class Monthview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'loading',
      yearNro: 0,
      monthNro: 0,
    };

    this.previousMonthClick = this.previousMonthClick.bind(this);
    this.nextMonthClick = this.nextMonthClick.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.update();
    this.getYear();
    this.getMonth();
  }

  /* eslint-disable-next-line */
  UNSAFE_componentWillReceiveProps() {
    this.setState(
      {
        state: 'loading',
      },
      () => {
        this.update();
      },
    );
  }

  getYear = () => {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      if (paramYear.length === 4) {
        this.setState({ yearNro: paramYear });
        return paramYear;
      }
    } catch {
      console.log('Error getting year from url');
    }
    const today = new Date(Date.now());
    const yyyy = today.getFullYear();
    this.setState({ yearNro: yyyy });
    return yyyy;
  };

  getMonth = () => {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      if (paramMonth.length === 2) {
        this.setState({ monthNro: paramMonth });
        return paramMonth;
      }
    } catch {
      console.log('Error getting month from url');
    }
    const today = new Date(Date.now());
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    this.setState({ monthNro: mm });
    return mm;
  };

  createWeekDay = () => {
    const table = [];
    let dayNumber;

    const fin = localStorage.getItem('language'); // eslint-disable-line
    const { month } = texts; // eslint-disable-line

    for (let j = 0; j < 8; j += 1) {
      dayNumber = j.toString();

      if (dayNumber === '0') {
        table.push(
          <div key="weekLabel" className={classes(css.weekNumber)}>
            {month.weekNumber[fin]}
          </div>,
        );
      } else {
        table.push(
          <div key={`weekDayLabel-${dayNumber}`}>
            {weekdayShorthand[dayNumber - 1][fin]}
          </div>,
        );
      }
    }

    return table;
  };

  createMonthTable = () => {
    const requestSchedulingFreeform = async (date) => {
      const response = await getSchedulingFreeform(date);

      if (response) {
        this.setState({
          state: 'ready',
          daysTable: response.month,
        });
      } else console.error('getting info failed');
    };

    const table = [];
    if (this.state.yearNro === 0) {
      return false;
    }

    let help = 0;
    const days = moment(
      `${this.state.yearNro}-${this.state.monthNro}`,
      'YYYY-MM',
    ).daysInMonth();
    const startDay = moment(
      `${this.state.yearNro}-${this.state.monthNro}-1`,
      'YYYY-MM-DD',
    );
    let firstMon = moment(
      `${this.state.yearNro}-${this.state.monthNro}-1`,
      'YYYY-MM-DD',
    );
    let info = false;

    const addDate = (target, isCurrent) => {
      const colorFromBackEnd = checkColor(this.state.daysTable, help);
      if (this.state.daysTable[help].tracks) {
        this.state.daysTable[help].tracks.forEach((track) => {
          if (track.notice !== null && track.notice !== '') {
            info = true;
          }
        });
      }
      help += 1;
      table.push(
        <Link
          key={`${isCurrent}-${firstMon.format('YYYY-MM-DD')}`}
          style={{ backgroundColor: `${colorFromBackEnd}` }}
          className={`${isCurrent}`}
          to={`/dayview/${firstMon.format('YYYY-MM-DD')}`}
        >
          {info ? (
            <div className={classes(css.monthviewDayImg)}>
              {target.date()}
              <img
                className={classes(css.MonthviewInfo)}
                src={smallInfoIcon}
                alt={month.Notice[fin]}
              />
            </div>
          ) : (
            <div>{target.date()}</div>
          )}
        </Link>,
      );
      target.add(1, 'days');
      info = false;
    };

    // safety loop incase of errors in name detection due to wrong locale, e.g. Sweden
    let safetyLoop = 0;

    while (
      firstMon.format('ddd') !== 'Mon' &&
      firstMon.format('ddd') !== 'ma'
    ) {
      firstMon = firstMon.subtract(1, 'days');
      if (safetyLoop > 7) {
        break;
      }
      safetyLoop += 1;
    }
    safetyLoop = 0;

    if (
      this.state.daysTable === undefined ||
      this.state.daysTable[0].date !== firstMon.format('YYYY-MM-DD')
    ) {
      requestSchedulingFreeform(firstMon.format('YYYY-MM-DD'));
    }
    if (this.state.daysTable === undefined) {
      return false;
    }
    // Check what is first monday and add days from that to start of month
    while (firstMon.format('ddd') !== startDay.format('ddd')) {
      addDate(firstMon, 'link notCurMonth');
    }

    // add days belonging to the month
    while (firstMon.format('D') < days) {
      addDate(firstMon, 'link');
    }

    addDate(firstMon, 'link');

    // add days until we get to end of week
    while (
      firstMon.format('ddd') !== 'Mon' &&
      firstMon.format('ddd') !== 'ma'
    ) {
      addDate(firstMon, 'link notCurMonth');
    }

    return table;
  };

  createWeekNumber = () => {
    const table = [];
    const days = moment(
      `${this.state.yearNro}-${this.state.monthNro}`,
      'YYYY-MM',
    ).daysInMonth();
    let startWeek = moment(
      `${this.state.yearNro}-${this.state.monthNro}-1`,
      'YYYY-MM-DD',
    ).isoWeek();
    const startHelp = moment(
      `${this.state.yearNro}-${this.state.monthNro}-1`,
      'YYYY-MM-DD',
    );
    const endWeek = moment(
      `${this.state.yearNro}-${this.state.monthNro}-${days}`,
      'YYYY-MM-DD',
    ).isoWeek();
    const link = moment(
      `${this.state.yearNro}-${this.state.monthNro}-1`,
      'YYYY-MM-DD',
    );

    if (this.state.yearNro === 0) {
      return false;
    }

    while (startHelp.isoWeek() !== endWeek) {
      table.push(
        <Link
          key={startWeek}
          className="link"
          to={`/weekview/${link.format('YYYY-MM-DD')}`}
        >
          <div>{startWeek}</div>
        </Link>,
      );
      link.add(1, 'weeks');
      startHelp.add(1, 'weeks');
      startWeek = startHelp.isoWeek();
    }

    table.push(
      <Link
        key={startWeek}
        className="link"
        to={`/weekview/${link.format('YYYY-MM-DD')}`}
      >
        <div>{startWeek}</div>
      </Link>,
    );

    return table;
  };

  previousMonthClick(e) {
    this.setState({
      state: 'loading',
    });

    e.preventDefault();
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );
      paramDateCorrect.add(1, 'days');
      paramDateCorrect.subtract(1, 'month');
      this.props.history.replace(
        `/monthview/${paramDateCorrect.toISOString().substring(0, 10)}`,
      ); // eslint-disable-line
      this.setState(
        {
          monthNro: paramMonth,
          yearNro: paramYear,
        },
        function () {
          this.update();
        },
      );
    } catch (err) {
      console.error(err);
      this.update();
    }
  }

  nextMonthClick(e) {
    this.setState({
      state: 'loading',
    });

    e.preventDefault();
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );
      paramDateCorrect.add(1, 'days');
      paramDateCorrect.add(1, 'month');
      this.props.history.replace(
        `/monthview/${paramDateCorrect.toISOString().substring(0, 10)}`,
      ); // eslint-disable-line
      this.setState(
        {
          monthNro: paramMonth,
          yearNro: paramYear,
        },
        function () {
          this.update();
        },
      );
    } catch (err) {
      console.error(err);
      this.update();
    }
  }

  update() {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');

      if (
        paramMonth === this.state.monthNro &&
        paramYear === this.state.yearNro
      ) {
        this.setState({
          state: 'ready',
        });
      }
      if (
        (paramMonth !== this.state.monthNro && this.state.monthNro !== 0) ||
        (paramYear !== 0 && paramYear !== this.state.yearNro)
      ) {
        this.setState({
          monthNro: paramMonth,
          yearNro: paramYear,
        });
      }
    } catch (err) {
      const date = new Date(Date.now());
      const paramMonth = String(date.getMonth() + 1).padStart(2, '0');
      this.setState({
        monthNro: paramMonth,
        yearNro: date.getYear(),
      });
      console.error(err);
      this.props.history.replace(
        `/Monthview/${date.toISOString().substring(0, 10)}`,
      );
    }
  }

  render() {
    const fin = localStorage.getItem('language'); // eslint-disable-line
    const { month } = texts; // eslint-disable-line
    const monthTable = this.createMonthTable();
    return (
      <div>
        {this.state.state !== 'ready' ? (
          <div className={classes(css.progress)}>
            <CircularProgress size="25vw" disableShrink />
          </div>
        ) : (
          <div>
            <div className={classes(css.dateHeaderM)}>
              <div
                className={classes(css.hoverHand, css.arrowLeft)}
                onClick={this.previousMonthClick}
                data-testid="previousMonth"
              />
              <h1 className={classes(css.dateHeaderText)}>
                {`${month[this.state.monthNro][fin]},`} {this.state.yearNro}
              </h1>
              <div
                className={classes(css.hoverHand, css.arrowRight)}
                onClick={this.nextMonthClick}
                data-testid="nextMonth"
              />
            </div>

            <div className={classes(css.monthContainer)}>
              <div className={classes(css.viewChanger)}>
                <div className={classes(css.viewChangerCurrent)}>
                  {jumpToCurrent()}
                </div>
                <div className={classes(css.viewChangerContainer)}>
                  {viewChanger()}
                </div>
              </div>
              <div className={classes(css.weekdays)}>
                {this.createWeekDay()}
              </div>
              <div className={classes(css.weekNumber)}>
                {this.createWeekNumber()}
              </div>
              <div className={classes(css.monthDays)}>{monthTable}</div>
            </div>
            <Infoboxes />
          </div>
        )}
      </div>
    );
  }
}

export default Monthview;
