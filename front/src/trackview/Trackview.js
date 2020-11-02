import React, { Component } from 'react';

import '../App.css';
import './Trackview.css';

import { Link } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// Utils
import { dayToString, getSchedulingDate } from '../utils/Utils';

// Translations
import data from '../texts/texts.json';

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
      const response = await getSchedulingDate(date);

      if (response !== false) {
        const selectedTrack = response.tracks.find((findItem) => findItem.name === track);
        // console.log("Results from api",response,selectedTrack);

        if (selectedTrack !== undefined) {
          this.setState({
            date: new Date(response.date),
            trackSupervision: selectedTrack.trackSupervision,
            rangeSupervision: response.rangeSupervision,
            name: selectedTrack.name,
            description: `(${selectedTrack.description})`,
            info: selectedTrack.notice,
          }, () => {
            document.getElementById('date').style.visibility = 'visible';
            document.getElementById('valvojat').style.visibility = 'visible';
            if (selectedTrack.notice > 0) {
              document.getElementById('infobox').style.visibility = 'visible';
            } else {
              document.getElementById('infobox').style.visibility = 'disabled';
            }
          });
        } else {
          console.error('track undefined');

          this.setState({
            name:
                  `Rataa nimeltä "${
                    this.props.match.params.track
                  }" ei löydy.`,
          });
          document.getElementById('date').style.visibility = 'hidden';
          document.getElementById('valvojat').style.visibility = 'hidden';
          document.getElementById('infobox').style.visibility = 'hidden';
        }
      } else console.error('getting info failed');
    };
    request();
  }

  rangeAvailability(trackview, fin) { // eslint-disable-line
    if (this.state.rangeSupervision === 'present') {
      const returnable = <Box class="isAvailable">{trackview.SuperGreen[fin]}</Box>;
      return returnable;
    } if (this.state.rangeSupervision === 'absent') {
      const returnable = (
        <Box class="isUnavailable">{trackview.SuperWhite[fin]}</Box>
      );
      return returnable;
    } if (this.state.rangeSupervision === 'confirmed') {
      const returnable = (
        <Box class="isConfirmed">{trackview.SuperLightGreen[fin]}</Box>
      );
      return returnable;
    } if (this.state.rangeSupervision === 'not confirmed') {
      const returnable = (
        <Box class="isNotConfirmed">{trackview.SuperBlue[fin]}</Box>
      );
      return returnable;
    } if (this.state.rangeSupervision === 'en route') {
      const returnable = (
        <Box class="isEnRoute">{trackview.SuperOrange[fin]}</Box>
      );
      return returnable;
    } if (this.state.rangeSupervision === 'closed') {
      const returnable = (
        <Box class="isClosed">{trackview.Red[fin]}</Box>
      );
      return returnable;
    }
  }

  trackAvailability(trackview, fin) { // eslint-disable-line
    if (this.state.trackSupervision === 'present') {
      const returnable = <Box class="isAvailable">{trackview.RangeGreen[fin]}</Box>;
      return returnable;
    }
    if (this.state.trackSupervision === 'absent') {
      const returnable = (
        <Box class="isUnavailable">{trackview.RangeWhite[fin]}</Box>
      );
      return returnable;
    }
    if (this.state.trackSupervision === 'closed') {
      const returnable = (
        <Box class="isClosed">{trackview.RangeRed[fin]}</Box>
      );
      return returnable;
    }
  }

  backlink() {
    return `/dayview/${this.props.match.params.date}`;
  }

  render() {
    // required for "this" to work in callback
    // alternative way without binding in constructor:
    this.update = this.update.bind(this);

    const { trackview } = data;
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
            <h3>
              {' '}
              {this.state.description}
            </h3>
          </div>
        </div>

        {/*    Päivämäärä */}
        <div id="date">
          <h2>
            {dayToString(this.state.date.getDay())}
            {' '}
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
          <p>
            {trackview.Info[fin]}
            :
          </p>
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
