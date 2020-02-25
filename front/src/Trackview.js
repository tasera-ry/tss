import React from "react";
import "./App.css";
import "./Trackview.css";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Container } from "@material-ui/core";

/*
 ** Returns finnish weekday according to integer parameter
 */
function dayToString(i) {
  if (i == 1) {
    return "Maanantai";
  }
  if (i == 2) {
    return "Tiistai";
  }
  if (i == 3) {
    return "Keskiviikko";
  }
  if (i == 4) {
    return "Torstai";
  }
  if (i == 5) {
    return "Perjantai";
  }
  if (i == 6) {
    return "Lauantai";
  }
  if (i == 7) {
    return "Sunnuntai";
  }
}

/*
 ** Returns red or green box according to if rangeofficer is avaivable
 */
function rangeAvaivability(binar) {
  if (binar == 1) {
    let returnable = <Box class="isAvaivable">Päävalvoja Paikalla</Box>;
    return returnable;
  }
  if (binar == 0) {
    let returnable = <Box class="isUnavaivable">Päävalvoja ei paikalla</Box>;
    return returnable;
  }
}

/*
 ** Returns red or green box according to if trackofficer is avaivable
 */
function trackAvaivability(binar) {
  if (binar == 1) {
    let returnable = <Box class="isAvaivable">Ratavalvoja Paikalla</Box>;
    return returnable;
  }
  if (binar == 0) {
    let returnable = <Box class="isUnavaivable">Ratavalvoja ei paikalla</Box>;
    return returnable;
  }
}

/*
 ** Main function
 */
function Trackview() {
  let date = new Date(Date.now());

  return (
    /*    Whole view */
    <div class="centerIt">
      {/*    Radan nimi ja kuvaus  */}
      <div class="centerIt container rowContainer">
        <h1 class="centerIt">Rata 1</h1>
        <h3 class="centerIt goDown"> Kivääri 200m</h3>
      </div>

      {/*    Päivämäärä */}
      <div>
        <h2 class="centerIt">
          {dayToString(date.getDay())} {date.toLocaleDateString()}
        </h2>
      </div>

      {/*    Päävalvojan ja ratavalvojan status  */}
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={1}
      >
        <Grid item xs={1} sm={6}>
          {rangeAvaivability(1)}
        </Grid>
        <Grid item xs={1} sm={6}>
          {trackAvaivability(1)}
        </Grid>
      </Grid>

      {/*    Infobox  */}
      <container>
        <p>Lisätietoja:</p>
        <div class="infoBox">
          Did you know octopuses don’t have tentacles; they have arms. A
          tentacle only has suckers at its end, while a cephalopod arm has
          suckers for most of its length.
        </div>
      </container>

      {/*    Linkki taaksepäin  */}
      <Link className="back" style={{ color: "black" }} to="/dayview">
        <ArrowBackIcon />
        Päivänäkymään
      </Link>
    </div>
  );
}

export default Trackview;
