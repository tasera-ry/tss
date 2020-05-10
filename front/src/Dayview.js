import React, { Component } from "react";
import "./Dayview.css";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { dayToString, getSchedulingDate } from "./utils/Utils";
import moment from 'moment';
import * as data from './texts/texts.json';


class Dayview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(Date.now()),
      opens: 16,
      closes: 20,
      rangeSupervision: false,
      tracks: {}
    };

    //required for "this" to work in callback
    //alternative way without binding in constructor:
    //public class fields syntax a.k.a. nextDayClick = (newObject) => {
    this.previousDayClick = this.previousDayClick.bind(this);
    this.nextDayClick = this.nextDayClick.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.update();
  }

  update() {
    // /dayview/2020-02-20
    let date = this.props.match.params.date;
    const request = async () => {
      const response = await getSchedulingDate(date);

      if(response !== false){
        console.log("Results from api",response);

        this.setState({
          date: new Date(response.date),
          tracks: response.tracks.sort((a, b) => a.name > b.name ? 1 : a.name === b.name ? 0 : -1),
          rangeSupervision: response.rangeSupervision,
          opens: moment(response.open,'HH:mm').format('H.mm'),
          closes: moment(response.close,'HH:mm').format('H.mm')
        });
      } else console.error("getting info failed");
      console.log(this.state)
    }
    request();
  }

  previousDayClick(e) {
    e.preventDefault();
    let date = new Date(this.state.date.setDate(this.state.date.getDate() - 1));
    this.props.history.replace("/dayview/" + date.toISOString());
    this.setState(
      {
        date: date
      },
      function() {
        this.update();
      }
    );
  }

  nextDayClick(e) {
    e.preventDefault();
    let date = new Date(this.state.date.setDate(this.state.date.getDate() + 1));
    this.props.history.replace("/dayview/" + date.toISOString());
    this.setState(
      {
        date: date
      },
      function() {
        this.update();
      }
    );
  }

  render() {
    const fin = localStorage.getItem("language");
    const {dayview} = data;

    function OfficerBanner(props) {
      let text;
      let color;

      if (props.rangeSupervision === 'present') {
        text = dayview.Green[fin];
        color = "greenB";
      }
      else if (props.rangeSupervision === 'absent') {
        text = dayview.White[fin];
        color = "whiteB";
      }
      else if (props.rangeSupervision === 'confirmed') {
        text = dayview.Lightgreen[fin];
        color = "lightGreenB";
      }
      else if (props.rangeSupervision === 'not confirmed') {
        text = dayview.Blue[fin];
        color = "blueB";
      }
      else if (props.rangeSupervision === 'en route') {
        text = dayview.Orange[fin];
        color = "yellowB";
      }
      else if (props.rangeSupervision === 'closed') {
        text = dayview.Red[fin];
        color = "redB";
      }

      return <h2 className={"info " + color}>{text}</h2>;
    }

    //builds tracklist with grid
    function TrackList(props) {
      let items = [];
      for (var key in props.tracks) {
        console.log(key);
        console.log(props.tracks[key].name);
        items.push(
          <TrackBox
            key={key}
            name={props.tracks[key].name}
            state={props.tracks[key].trackSupervision}
            //TODO final react routing
            to={"/trackview/"+props.date.toISOString()+"/" + props.tracks[key].name}
          />
        );
      }

      return (
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          className="sevenGrid"
        >
          {items}
        </Grid>
      );
    }

    //single track
    function TrackBox(props) {
      let color;

      if (props.state === "present") {
        //open
        color = "greenB";
      } else if (props.state === "absent") {
        color = "whiteB";
      } else if (props.state === "closed") {
        //closed
        color = "redB";
      }

      return (
        <Grid item className="track hoverHand" xs={12} sm={2}>
          <Link className="trackBoxLink" to={props.to}>
            <p>{props.name}</p>
            <Box className={"clickableBox " + color}>&nbsp;</Box>
          </Link>
        </Grid>
      );
    }

    return (
      <div className="dayviewContainer">
        {/* Whole view */}
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
        >
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
            ></div>
            <div className="titleContainer">
              <h1>
                {dayToString(this.state.date.getDay())}
                {console.log(this.state.date.getDay())}
              </h1>
              <div className="date">{this.state.date.toLocaleDateString("fi-FI")}</div>
            </div>
            <div
              className="hoverHand arrow-right"
              onClick={this.nextDayClick}
            ></div>
          </Grid>
          {/* Range info */}
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12}>
              <OfficerBanner rangeSupervision={this.state.rangeSupervision} />
            </Grid>
          </Grid>
          {/* MUI grid */}
          <TrackList tracks={this.state.tracks} date={this.state.date} />
          {/* Other info */}
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            className="otherInfo"
          >
            <Grid item xs={6} sm={3}>
              {dayview.OpenHours[fin]}: {this.state.opens}-{this.state.closes}
            </Grid>
            <Grid item xs={6} sm={3}>
              <div className="colorInfo">
                <Box className="excolor greenB">&nbsp;</Box>
                <p>{dayview.Open[fin]}</p>
              </div>
              <div className="colorInfo">
                <Box className="excolor redB">&nbsp;</Box>
                <p>{dayview.Closed[fin]}</p>
              </div>
              <div className="colorInfo">
                <Box className="excolor whiteB">&nbsp;</Box>
                <p>{dayview.NotAvailable[fin]}</p>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Link className="back" style={{ color: "black" }} to="/weekview">
          <ArrowBackIcon />
          {dayview.WeekviewLink[fin]}
        </Link>
      </div>
    );
  }
}

export default Dayview;
