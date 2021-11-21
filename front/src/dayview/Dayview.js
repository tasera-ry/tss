import React, { Component } from 'react';

import './Dayview.css';

// Material UI components
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

// Utils
import moment from 'moment';
import {
  dayToString, jumpToCurrent, getSchedulingDate, viewChanger,
} from '../utils/Utils';

// Moment for date handling
import info from '../logo/Info.png';

// Translations
import data from '../texts/texts.json';

import classNames from 'classnames';
import css from './Dayview.module.scss'

const classes = classNames.bind(css);

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

  UNSAFE_componentWillReceiveProps() { // eslint-disable-line
    this.setState({
      state: 'loading',
    }, () => {
      this.update();
    });
  }

  update() {
    // /dayview/2020-02-20
    const { date } = this.props.match.params; // eslint-disable-line
    const request = async () => {
      const response = await getSchedulingDate(date);

      if (response !== false) {
        this.setState({
          state: 'ready',
          date: new Date(response.date),
          tracks: response.tracks,
          rangeSupervision: response.rangeSupervision,
          opens: moment(response.open, 'HH:mm').format('H.mm'),
          closes: moment(response.close, 'HH:mm').format('H.mm'),
        });
      } else console.error('getting info failed');
    };
    request();
  }

  previousDayClick(e) {
    e.preventDefault();
    const date = new Date(this.state.date.setDate(this.state.date.getDate() - 1)); // eslint-disable-line
    const dateFormatted = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
    const date = new Date(this.state.date.setDate(this.state.date.getDate() + 1)); // eslint-disable-line
    const dateFormatted = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
    const { dayview } = data;

    function OfficerBanner(props) {
      let text;
      let color;

      if (props.rangeSupervision === 'present') {
        text = dayview.Green[fin];
        color = css.greenB;
      } else if (props.rangeSupervision === 'absent') {
        text = dayview.White[fin];
        color = css.whiteB;
      } else if (props.rangeSupervision === 'confirmed') {
        text = dayview.Lightgreen[fin];
        color = css.lightGreenB;
      } else if (props.rangeSupervision === 'not confirmed') {
        text = dayview.Blue[fin];
        color = css.blueB;
      } else if (props.rangeSupervision === 'en route') {
        text = dayview.Orange[fin];
        color = css.yellowB;
      } else if (props.rangeSupervision === 'closed') {
        text = dayview.Red[fin];
        color = css.redB;
      }

      return <h2 className={classes(css.info, color)} >{text}</h2>;
    }

    // builds tracklist with grid
    function TrackList(props) {
      const items = [];
      for (var key in props.tracks) { // eslint-disable-line
        items.push(
          <TrackBox
            key={key}
            name={props.tracks[key].name}
            short_description={props.tracks[key].short_description}
            state={props.tracks[key].trackSupervision}
            notice={props.tracks[key].notice}
            to={`/trackview/${props.date.toISOString().substring(0, 10)}/${props.tracks[key].name}`}
          />,
        );
      }

      return (
        <Grid className={classes(css.sevenGrid)}>
          {items}
        </Grid>
      );
    }

    // single track
    function TrackBox(props) {
      let color;

      if (props.state === 'present') {
        // open
        color = css.greenB;
      } else if (props.state === 'absent') {
        color = css.whiteB;
      } else if (props.state === 'closed') {
        // closed
        color = css.redB;
      }

      return (
        <Grid item className={classes(css.track, css.hoverHand, color)} xs={12} sm={2}>
          <Link className={classes(css.trackBoxLink)} to={props.to}>
            <span className={classes(css.bold)}>
              {props.name}
            </span>
            <span className={classes(css.hidden)}>
              -
            </span>
            <span className={classes(css.linebreak)}>
              <br />
            </span>
            <span className={classes(css.overflowHidden)}>
              {props.short_description}
            </span>
            {props.notice.length === 0
              ? <br />
              : (
                <div className={classes(css.DayviewInfo)}>
                  <img className={classes(css.infoImg2)} src={info} alt={dayview.Notice[fin]} />
                </div>
              )}
          </Link>
        </Grid>
      );
    }

    return (
      <div>
        <div className={classes(css.dayviewContainer)}>
          {/* Date header */}
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
            className={classes(css.dataHeader)}
          >
            <div
              className={classes(css.hoverHand, css.arrowLeft)}
              onClick={this.previousDayClick}
              data-testid="previousDay"
            />
            <div className={classes(css.titleContainer)}>
              <h1 className={classes(css.headerText)}>
                <span>{dayToString(this.state.date.getDay())}</span>
                <span>&nbsp;&nbsp;</span>
                <span>{this.state.date.toLocaleDateString('fi-FI')}</span>
              </h1>

            </div>
            <div
              className={classes(css.hoverHand, css.arrowRight)}
              onClick={this.nextDayClick}
              data-testid="nextDay"
            />
          </Grid>
          {/* Range officer info */}
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12}>
              {this.state.state !== 'ready'
                ? <br />
                : <OfficerBanner rangeSupervision={this.state.rangeSupervision} />}
            </Grid>
          </Grid>

          {/* open and close hours */}
          <h2 className={classes(css.headerText)}>
            {dayview.OpenHours[fin]}
            :
            {this.state.opens}
            -
            {this.state.closes}
          </h2>
          {/* Whole view */}
          <div className={classes(css.dayviewBigContainer)}>
            <div className={classes(css.viewChanger)}>
              <div className={classes(css.viewChangerCurrent)}>
                {jumpToCurrent()}
              </div>
              <div className={classes(css.viewChangerCurrent)}>
                {viewChanger()}
              </div>
            </div>
            <div className={classes(css.dayviewTrackContainer)}>

              {/* MUI grid - used for displaying the track info */}
              {this.state.state !== 'ready'
                ? (
                  <div>
                    <CircularProgress disableShrink />
                  </div>
                )
                : <TrackList tracks={this.state.tracks} date={this.state.date} />}

              {/* Other info */}

            </div>
          </div>
          <Link className={classes(css.back)} style={{ color: 'black' }} to={`/weekview/${this.state.date.toISOString().substring(0, 10)}`}>
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
            <div className={classes(css.infoItem)}>
              <p className={classes(css.box, css.noFlex, css.greenB)} />
              {/* Open */}
              {' '}
              <p>{dayview.Open[fin]}</p>
            </div>
            <div className={classes(css.infoItem)}>
              <p className={classes(css.box, css.noFlex, css.redB)} />
              {/* Closed */}
              {' '}
              <p>{dayview.Closed[fin]}</p>
            </div>
            <div className={classes(css.infoItem)}>
              <p className={classes(css.box, css.noFlex, css.whiteB)} />
              {/* No supervisor */}
              {' '}
              <p>{dayview.NotAvailable[fin]}</p>
            </div>
            <div className={classes(css.infoItemImg)}>
              <p className={classes(css.noFlex)}>
                <img className={classes(css.infoImg, css.noFlex)} src={info} alt={dayview.Notice[fin]} />
              </p>
              {/* Extra info on track */}
              {' '}
              <p className={classes(css.infoText, css.relativeText, css.noFlex)}>{dayview.Notice[fin]}</p>
            </div>
          </Grid>

        </div>

      </div>
    );
  }
}

export default Dayview;
