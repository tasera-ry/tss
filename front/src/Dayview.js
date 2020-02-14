import React from 'react';
import './App.css';
import {Link} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';


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
        <Grid item xs={6}>
            Maanantai {Date.now()}
        </Grid>
        {/* Range info */}
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="center"
        >
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper}>Päävalvoja paikalla</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
          <Grid item xs={1} sm={1}>
            <Paper className={classes.paper}>1</Paper>
            <Paper className={classes.paper}>a</Paper>
          </Grid>
        </Grid>
        {/* Other info */}
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item xs={3} sm={3}>
            <Paper className={classes.paper}>Aukiolo: 16-20</Paper>
          </Grid>
          <Grid item xs={3} sm={3}>
            <Paper className={classes.paper}>Avoinna</Paper>
            <Paper className={classes.paper}>Suljettu</Paper>
            <Paper className={classes.paper}>Ei valvojaa</Paper>
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