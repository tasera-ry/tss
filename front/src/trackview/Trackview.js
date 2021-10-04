import React, { Component } from 'react';
import '../App.css';
import './Trackview.css';

import { Link } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import api from '../api/api';
import { dayToString } from '../utils/Utils';
import translations from '../texts/texts.json';

/*
 ** Main function
 */
class Trackview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(Date.now()),
      opens: 16, // eslint-disable-line
      closes: 20, // eslint-disable-line
      rangeSupervision: false,
      trackSupervision: false,
      info: '',
      parent: props.getParent, // eslint-disable-line
      name: 'rata 1',
      description: '',
    };
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.update();
  }

  update() {
    // /dayview/2020-02-20
    const { date } = this.props.match.params;
    const { track } = this.props.match.params;
    const request = async () => {
      try {
        const data = await api.getSchedulingDate(date);

        const selectedTrack = data.tracks.find(
          (findItem) => findItem.name === track,
        );
        if (selectedTrack !== undefined) {
          this.setState(
            {
              date: new Date(data.date),
              trackSupervision: selectedTrack.trackSupervision,
              rangeSupervision: data.rangeSupervision,
              name: selectedTrack.name,
              description: `(${selectedTrack.description})`,
              info: selectedTrack.notice,
            },
            () => {
              document.getElementById('date').style.visibility = 'visible';
              document.getElementById('valvojat').style.visibility = 'visible';
              if (selectedTrack.notice > 0) {
                document.getElementById('infobox').style.visibility = 'visible';
              } else {
                document.getElementById('infobox').style.visibility =
                  'disabled';
              }
            },
          );
        } else {
          console.error('track undefined');

          this.setState({
            name: `Rataa nimeltä "${this.props.match.params.track}" ei löydy.`,
          });
          document.getElementById('date').style.visibility = 'hidden';
          document.getElementById('valvojat').style.visibility = 'hidden';
          document.getElementById('infobox').style.visibility = 'hidden';
        }
      } catch (err) {
        console.log(err);
      }
    };
    request();
  }

  /* eslint-disable-next-line */
  rangeAvailability(trackview, fin) {
    if (this.state.rangeSupervision === 'present') {
      const returnable = (
        <Box className="isAvailable">{trackview.SuperGreen[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.rangeSupervision === 'absent') {
      const returnable = (
        <Box className="isUnavailable">{trackview.SuperWhite[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.rangeSupervision === 'confirmed') {
      const returnable = (
        <Box className="isConfirmed">{trackview.SuperLightGreen[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.rangeSupervision === 'not confirmed') {
      const returnable = (
        <Box className="isNotConfirmed">{trackview.SuperBlue[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.rangeSupervision === 'en route') {
      const returnable = (
        <Box className="isEnRoute">{trackview.SuperOrange[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.rangeSupervision === 'closed') {
      const returnable = <Box className="isClosed">{trackview.Red[fin]}</Box>;
      return returnable;
    }
  }

  /* eslint-disable-next-line */
  trackAvailability(trackview, fin) {
    if (this.state.trackSupervision === 'present') {
      const returnable = (
        <Box className="isAvailable">{trackview.RangeGreen[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.trackSupervision === 'absent') {
      const returnable = (
        <Box className="isUnavailable">{trackview.RangeWhite[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.trackSupervision === 'closed') {
      const returnable = (
        <Box className="isClosed">{trackview.RangeRed[fin]}</Box>
      );
      return returnable;
    }
  }

  backlink() {
    const date = new Date(this.state.date.setDate(this.state.date.getDate()));
    const dateFormatted = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    return `/dayview/${dateFormatted}`;
  }

  render() {
    // required for "this" to work in callback
    // alternative way without binding in constructor:
    this.update = this.update.bind(this);

    const { trackview } = translations;
    const fin = localStorage.getItem('language');

    return (
      /*    Whole view */
      <div className="wholeScreenDiv">
        {/*    Radan nimi ja kuvaus  */}
        <div className="trackNameAndType">
          <div>
            <h1>{this.state.name}</h1>
          </div>
          <div>
            <h3> {this.state.description}</h3>
          </div>
        </div>

        {/*    Päivämäärä */}
        <div id="date">
          <h2>
            {dayToString(this.state.date.getDay())}{' '}
            {this.state.date.toLocaleDateString('fi-FI')}
          </h2>
        </div>

        {/*    Päävalvojan ja ratavalvojan status  */}
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="left"
          spacing={1}
          id="valvojat"
        >
          {/*   pyydetään metodeilta boxit joissa radan tila */}
          <Grid item xs={1} sm={6}>
            {this.rangeAvailability(trackview, fin)}
          </Grid>
          <Grid item xs={1} sm={6}>
            {this.trackAvailability(trackview, fin)}
          </Grid>
        </Grid>

        {/*    Infobox  */}
        <div id="infobox">
          <p>{trackview.Info[fin]}:</p>
          <div className="infoBox">{this.state.info}</div>
        </div>
        {/*    Linkki taaksepäin  */}
        <Link
          className="backLink"
          style={{ color: 'black' }}
          to={this.backlink()}
        >
          <ArrowBackIcon />
          {trackview.DayviewLink[fin]}
        </Link>
      </div>
    );
  }
}

export default Trackview;
