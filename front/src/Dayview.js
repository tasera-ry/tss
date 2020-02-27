import React, { Component } from "react";
import './Dayview.css';
import {Link} from 'react-router-dom';
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import {callApi} from './utils/helper.js';
import { dayToString } from "./utils/Utils";

class Dayview extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(Date.now())
    };
  }

  componentDidMount(){
    // /dayview/2020-02-20
    let date = this.props.match.params.date;

    callApi("GET","tracks/"+ (date ? date : ""))
      .then(res => {
        console.log(res)
        
        //async joten tietoa päivittäessä voi välähtää Date.now antama
        //ennen haluttua tietoa
        this.setState({
          date: new Date(res.date)
        });
      })
      .catch(err => console.log(err));
  }
  
  render() {
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
            <div className="hoverHand arrow-left"></div>
            <h1>{dayToString(this.state.date.getDay())}</h1> 
            <div>{this.state.date.toLocaleDateString()}</div>
            <div className="hoverHand arrow-right"></div>
          </Grid>
          {/* Range info */}
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <h2 className="info greenB">Päävalvoja paikalla</h2>
            </Grid>
          </Grid>
          {/* MUI grid */}
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            className="sevenGrid"
          >
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 1</p>
              <Box className="clickableBox" >&nbsp;</Box>
            </Grid>
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 2</p>
              <Box className="clickableBox greenB" >&nbsp;</Box>
            </Grid>
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 3</p>
              <Box className="clickableBox redB" >&nbsp;</Box>
            </Grid>
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 4</p>
              <Box className="clickableBox redB" >&nbsp;</Box>
            </Grid>
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 5</p>
              <Box className="clickableBox redB" >&nbsp;</Box>
            </Grid>
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 6</p>
              <Box className="clickableBox redB" >&nbsp;</Box>
            </Grid>
            <Grid item className="track hoverHand" xs={12} sm={2}>
              <p>Rata 7</p>
              <Box className="clickableBox redB" >&nbsp;</Box>
            </Grid>
          </Grid>
          {/* Other info */}
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            className="otherInfo"
          >
            <Grid item xs={6} sm={3}>
              Aukiolo: 16-20
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
        <Link className="back" style={{color: 'black'}} to='/weekview'>
          <ArrowBackIcon />Viikkonäkymään
        </Link>
        <Link className="hoverHand arrow-right" to="/trackview">Ratanäkymä</Link>
      </div>
    );
  }
}

export default Dayview;