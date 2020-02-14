import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';


function Dayview() {
  
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
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
            <Box style={{background:'green'}}>Päävalvoja paikalla</Box>
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="center"
          style={{background:'cyan'}}
        >
          <Grid item sm>
            <div style={{background:'gray',border:'solid 1px black'}}>
              <p>Rata 1</p>
              <Box style={{background:'green',padding:'50px'}}>a</Box>
            </div>
          </Grid>
          <Grid item sm>
            <div>
              <p>1</p>
              <Box style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item sm>
            <div>
              <p>1</p>
              <Box style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item sm>
            <div>
              <p>1</p>
              <Box style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item sm>
            <div>
              <p>1</p>
              <Box style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item sm>
            <div>
              <p>1</p>
              <Box style={{background:'red'}}>a</Box>
            </div>
          </Grid>
          <Grid item sm>
            <div>
              <p>1</p>
              <Box style={{background:'red'}}>a</Box>
            </div>
          </Grid>
        </Grid>
        {/* Other info */}
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid item xs={3} sm={3}>
            <div>Aukiolo: 16-20</div>
          </Grid>
          <Grid item xs={3} sm={3}>
            <div>
              <Box style={{background:'green',border:'solid 1px black',width:'20px',margin:'0 5px 0 0', display:'inline-block'}}>&nbsp;</Box>
              <div style={{display:'inline-block'}}>Avoinna</div>
            </div>
            <div>
              <Box style={{background:'red',border:'solid 1px black',width:'20px',margin:'0 5px 0 0', display:'inline-block'}}>&nbsp;</Box>
              <div style={{display:'inline-block'}}>Suljettu</div>
            </div>
            <div>
              <Box style={{background:'white',border:'solid 1px black',width:'20px',margin:'0 5px 0 0', display:'inline-block'}}>&nbsp;</Box>
              <div style={{display:'inline-block'}}>Ei valvojaa</div>
            </div>
          </Grid>
        </Grid>
      </Grid>
      <Link style={{color: 'black'}} to='/weekview'>
        <p>Viikkonäkymään</p>
      </Link>
    </div>
  );
}

export default Dayview;