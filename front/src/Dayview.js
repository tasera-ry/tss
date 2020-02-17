import React from 'react';
//import './App.css';
import './Dayview.css';
import {Link} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';


function Dayview() {
  
  return (
    <div class="container">
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
            <div>Prev</div>
            <div>Maanantai</div> 
            <div>{Date.now()}</div>
            <div>Next</div>
        </Grid>
        {/* Range info */}
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Box class="info">Päävalvoja paikalla</Box>
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="center"
          style={{background:'cyan'}}
        >
          <Grid item xs={12} sm>
            <div class="track">
              <p>Rata 1</p>
              <Box class="clickableBox" >a</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div class="track">
              <p>1</p>
              <Box class="clickableBox" style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div class="track">
              <p>1</p>
              <Box class="clickableBox" style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div class="track">
              <p>1</p>
              <Box class="clickableBox" style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div class="track">
              <p>1</p>
              <Box class="clickableBox" style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div class="track">
              <p>1</p>
              <Box class="clickableBox" style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div class="track">
              <p>1</p>
              <Box class="clickableBox" style={{background:'red'}}>a</Box>
            </div>
          </Grid>
        </Grid>
        {/* Other info */}
        <div class="otherInfo">
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item xs={6} sm={3}>
              <div class="colorInfo">Aukiolo: 16-20</div>
            </Grid>
            <Grid item xs={6} sm={3}>
              <div class="colorInfo">
                <Box class="excolor greenB">&nbsp;</Box>
                <div class="excolorText">Avoinna</div>
              </div>
              <div class="colorInfo">
                <Box class="excolor redB">&nbsp;</Box>
                <div class="excolorText">Suljettu</div>
              </div>
              <div class="colorInfo">
                <Box class="excolor whiteB">&nbsp;</Box>
                <div class="excolorText">Ei valvojaa</div>
              </div>
            </Grid>
          </Grid>
        </div>
      </Grid>
      <Link style={{color: 'black'}} to='/weekview'>
        <p>Viikkonäkymään</p>
      </Link>
    </div>
  );
}

export default Dayview;