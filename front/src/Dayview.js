import React from 'react';
//import './App.css';
import './Dayview.css';
import {Link} from 'react-router-dom';
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';


function Dayview() {

  let date = new Date(Date.now());
  
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
            <h1>Maanantai</h1> 
            <div>{date.toString()}</div>
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
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          style={{border:'solid 1px black'}}
        >
          <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>Rata 1</p>
              <Box className="clickableBox" >&nbsp;</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>2</p>
              <Box className="clickableBox" style={{background:'red'}}>&nbsp;</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>3</p>
              <Box className="clickableBox" style={{background:'red'}}>&nbsp;</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>4</p>
              <Box className="clickableBox" style={{background:'red'}}>&nbsp;</Box>
            </div>
          </Grid>
                    <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>5</p>
              <Box className="clickableBox" style={{background:'red'}}>&nbsp;</Box>
            </div>
          </Grid>
                    <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>6</p>
              <Box className="clickableBox" style={{background:'red'}}>&nbsp;</Box>
            </div>
          </Grid>
                    <Grid item xs={12} sm={2}>
            <div className="track hoverHand">
              <p>7</p>
              <Box className="clickableBox" style={{background:'red'}}>&nbsp;</Box>
            </div>
          </Grid>
        </Grid>
        {/* Other info */}
        <div className="otherInfo">
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item xs={6} sm={3}>
              <div className="colorInfo">Aukiolo: 16-20</div>
            </Grid>
            <Grid item xs={6} sm={3}>
              <div className="colorInfo">
                <Box className="excolor greenB">&nbsp;</Box>
                <div className="excolorText">Avoinna</div>
              </div>
              <div className="colorInfo">
                <Box className="excolor redB">&nbsp;</Box>
                <div className="excolorText">Suljettu</div>
              </div>
              <div className="colorInfo">
                <Box className="excolor whiteB">&nbsp;</Box>
                <div className="excolorText">Ei valvojaa</div>
              </div>
            </Grid>
          </Grid>
        </div>
      </Grid>
      <Link style={{color: 'black'}} to='/weekview'>
        <p className="back"><ArrowBackIcon />Viikkonäkymään</p>
      </Link>
    </div>
  );
}

export default Dayview;