import React, { Component } from 'react';
import './Dayview.css';

// Material UI components
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

// Utils
import moment from 'moment';
import api from '../api/api';
import { dayToString, jumpToCurrent, viewChanger } from '../utils/Utils';

// Moment for date handling
import info from '../logo/Info.png';

import translations from '../texts/texts.json';

/*
  Dayview-component for handling day-specific view
  tracks for a certain date
*/
class Dayview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'loading',
      date: new Date(Date.now()),
      opens: 16,
      closes: 20,
      rangeSupervision: false,
      tracks: {},
    };

    // required for "this" to work in callback
    // alternative way without binding in constructor:
    // public class fields syntax a.k.a. nextDayClick = (newObject) => {
    this.previousDayClick = this.previousDayClick.bind(this);
    this.nextDayClick = this.nextDayClick.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.update();
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

  update() {
    // /dayview/2020-02-20
    const { date } = this.props.match.params; // eslint-disable-line
    const request = async () => {
      try {
        const data = await api.getSchedulingDate(date);

        this.setState({
          state: 'ready',
          date: new Date(data.date),
          tracks: data.tracks,
          rangeSupervision: data.rangeSupervision,
          opens: moment(data.open, 'HH:mm').format('H.mm'),
          closes: moment(data.close, 'HH:mm').format('H.mm'),
        });
      } catch (err) {
        console.error(err);
        console.error('getting info failed');
      }
    };
    request();
  }

  previousDayClick(e) {
    e.preventDefault();
    const date = new Date(
      this.state.date.setDate(this.state.date.getDate() - 1),
    ); // eslint-disable-line
    const dateFormatted = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    this.props.history.replace(`/dayview/${dateFormatted}`); // eslint-disable-line
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
    const date = new Date(
      this.state.date.setDate(this.state.date.getDate() + 1),
    ); // eslint-disable-line
    const dateFormatted = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    this.props.history.replace(`/dayview/${dateFormatted}`); // eslint-disable-line
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

  render() {
    const fin = localStorage.getItem('language');
    const { dayview } = translations;

    function OfficerBanner(props) {
      let text;
      let color;

      if (props.rangeSupervision === 'present') {
        text = dayview.Green[fin];
        color = 'greenB';
      } else if (props.rangeSupervision === 'absent') {
        text = dayview.White[fin];
        color = 'whiteB';
      } else if (props.rangeSupervision === 'confirmed') {
        text = dayview.Lightgreen[fin];
        color = 'lightGreenB';
      } else if (props.rangeSupervision === 'not confirmed') {
        text = dayview.Blue[fin];
        color = 'blueB';
      } else if (props.rangeSupervision === 'en route') {
        text = dayview.Orange[fin];
        color = 'yellowB';
      } else if (props.rangeSupervision === 'closed') {
        text = dayview.Red[fin];
        color = 'redB';
      }

      return <h2 className={`info ${color}`}>{text}</h2>;
    }

    // builds tracklist with grid
    function TrackList(props) {
      const items = [];
      for (const key in props.tracks) {
        items.push(
          <TrackBox
            key={key}
            name={props.tracks[key].name}
            short_description={props.tracks[key].short_description}
            state={props.tracks[key].trackSupervision}
            notice={props.tracks[key].notice}
            to={`/trackview/${props.date.toISOString().substring(0, 10)}/${
              props.tracks[key].name
            }`}
          />,
        );
      }

      return <Grid className="sevenGrid">{items}</Grid>;
    }

    // single track
    function TrackBox(props) {
      let color;

      if (props.state === 'present') {
        // open
        color = 'greenB';
      } else if (props.state === 'absent') {
        color = 'whiteB';
      } else if (props.state === 'closed') {
        // closed
        color = 'redB';
      }

      return (
        <Grid item className={`track hoverHand ${color}`} xs={12} sm={2}>
          <Link className="trackBoxLink" to={props.to}>
            <span className="bold">{props.name}</span>
            <span className="hidden">-</span>
            <span className="linebreak">
              <br />
            </span>
            <span className="overflowHidden">{props.short_description}</span>
            {props.notice.length === 0 ? (
              <br />
            ) : (
              <div className="DayviewInfo">
                <img
                  className="infoImg-2"
                  src={info}
                  alt={dayview.Notice[fin]}
                />
              </div>
            )}
          </Link>
        </Grid>
      );
    }

    return (
      <div>
        <div className="dayviewContainer">
          {/* Date header */}
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
            className="dateHeader"
          >
            <div
              className="hoverHand arrow-left"
              onClick={this.previousDayClick}
              data-testid="previousDay"
            />
            <div className="titleContainer">
              <h1 className="headerText">
                <span>{dayToString(this.state.date.getDay())}</span>
                <span>&nbsp;&nbsp;</span>
                <span>{this.state.date.toLocaleDateString('fi-FI')}</span>
              </h1>
            </div>
            <div
              className="hoverHand arrow-right"
              onClick={this.nextDayClick}
              data-testid="nextDay"
            />
          </Grid>
          {/* Range officer info */}
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12}>
              {this.state.state !== 'ready' ? (
                <br />
              ) : (
                <OfficerBanner rangeSupervision={this.state.rangeSupervision} />
              )}
            </Grid>
          </Grid>

          {/* open and close hours */}
          <h2 className="headerText">
            {dayview.OpenHours[fin]}:{this.state.opens}-{this.state.closes}
          </h2>
          {/* Whole view */}
          <div className="dayview-big-container">
            <div className="viewChanger">
              <div className="viewChanger-current">{jumpToCurrent()}</div>
              <div className="viewChanger-container">{viewChanger()}</div>
            </div>
            <div className="dayviewTrackContainer">
              {/* MUI grid - used for displaying the track info */}
              {this.state.state !== 'ready' ? (
                <div>
                  <CircularProgress disableShrink />
                </div>
              ) : (
                <TrackList tracks={this.state.tracks} date={this.state.date} />
              )}

              {/* Other info */}
            </div>
          </div>
          <Link
            className="back"
            style={{ color: 'black' }}
            to={`/weekview/${this.state.date.toISOString().substring(0, 10)}`}
          >
            <ArrowBackIcon />
            {dayview.WeekviewLink[fin]}
          </Link>

          <hr />

          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            className="otherInfo"
          >
            {/* color info boxes */}
            <div className="info-item">
              <p className="box no-flex greenB" />
              {/* Open */} <p>{dayview.Open[fin]}</p>
            </div>
            <div className="info-item">
              <p className="box no-flex redB" />
              {/* Closed */} <p>{dayview.Closed[fin]}</p>
            </div>
            <div className="info-item">
              <p className="box no-flex whiteB" />
              {/* No supervisor */} <p>{dayview.NotAvailable[fin]}</p>
            </div>
            <div className="info-item-img">
              <p className="empty-box no-flex">
                <img
                  className="infoImg no-flex"
                  src={info}
                  alt={dayview.Notice[fin]}
                />
              </p>
              {/* Extra info on track */}{' '}
              <p className="info-text relative-text no-flex">
                {dayview.Notice[fin]}
              </p>
            </div>
          </Grid>
        </div>
      </div>
    );
  }
}

export default Dayview;
