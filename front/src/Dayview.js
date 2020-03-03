import React, { Component } from "react";
import "./Dayview.css";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { callApi } from "./utils/helper.js";
import { dayToString } from "./utils/Utils";

class Dayview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(Date.now()),
      opens: 16,
      closes: 20,
      rangeOfficer: false,
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
    callApi("GET", "date/" + (date ? date : ""))
      .then(res => {
        console.log(res);

        //async joten tietoa päivittäessä voi välähtää Date.now antama
        //ennen haluttua tietoa
        this.setState({
          date: new Date(res.date),
          tracks: res.tracks
        });
      })
      .catch(err => console.log(err));
  }

  previousDayClick(e) {
    e.preventDefault();
    let date = new Date(this.state.date.setDate(this.state.date.getDate() - 1));
    this.props.history.push("/dayview/" + date.toISOString());
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
    this.props.history.push("/dayview/" + date.toISOString());
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
    function OfficerBanner(props) {
      let text;
      let color;

      if (props.available) {
        text = "Päävalvoja paikalla";
        color = "greenB";
      } else {
        text = "Päävalvoja ei ole paikalla";
        color = "redB";
      }

      return <h2 className={"info " + color}>{text}</h2>;
    }

    //builds tracklist with grid
    function TrackList(props) {
      let items = [];
      for (var key in props.tracks) {
        console.log(key);
        items.push(
          <TrackBox
            key={key}
            name={key}
            state={props.tracks[key]}
            to={"/trackview/date?/" + key}
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

      if (props.state === 1) {
        //open
        color = "greenB";
      } else if (props.state === 2) {
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
      <div className="container">
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
          >
            <div
              className="hoverHand arrow-left"
              onClick={this.previousDayClick}
            ></div>
            <h1>
              {dayToString(this.state.date.getDay())}
              {console.log(this.state.date.getDay())}
            </h1>
            <div>{this.state.date.toLocaleDateString("fi-FI")}</div>
            <div
              className="hoverHand arrow-right"
              onClick={this.nextDayClick}
            ></div>
          </Grid>
          {/* Range info */}
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12}>
              <OfficerBanner available={this.state.rangeOfficer} />
            </Grid>
          </Grid>
          {/* MUI grid */}
          <TrackList tracks={this.state.tracks} />
          {/* Other info */}
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            className="otherInfo"
          >
            <Grid item xs={6} sm={3}>
              Aukiolo: {this.state.opens}-{this.state.closes}
            </Grid>
            <Grid item xs={6} sm={3}>
              <div className="colorInfo">
                <Box className="excolor greenB">&nbsp;</Box>
                <p>Avoinna</p>
              </div>
              <div className="colorInfo">
                <Box className="excolor redB">&nbsp;</Box>
                <p>Suljettu</p>
              </div>
              <div className="colorInfo">
                <Box className="excolor whiteB">&nbsp;</Box>
                <p>Ei valvojaa</p>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Link className="back" style={{ color: "black" }} to="/weekview">
          <ArrowBackIcon />
          Viikkonäkymään
        </Link>
        <Link className="hoverHand arrow-right" to="/trackview">
          Ratanäkymä
        </Link>
      </div>
    );
  }
}

export default Dayview;
