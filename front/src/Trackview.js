import React from "react";
import "./App.css";
import "./Trackview.css";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import { dayToString } from "./utils/Utils";

/*
 ** Returns red or green box according to if rangeofficer is avaivable
 ** !!!!! Rewrite when start getting data from backend
 */
function rangeAvaivability(binar) {
  if (binar === 1) {
    let returnable = <Box class="isAvaivable">Päävalvoja Paikalla</Box>;
    return returnable;
  }
  if (binar === 0) {
    let returnable = <Box class="isUnavaivable">Päävalvoja ei paikalla</Box>;
    return returnable;
  }
}

/*
 ** Returns red or green box according to if trackofficer is avaivable
 ** !!!!! Rewrite when start getting data from backend
 */
function trackAvaivability(binar) {
  if (binar === 1) {
    let returnable = <Box class="isAvaivable">Ratavalvoja Paikalla</Box>;
    return returnable;
  }
  if (binar === 0) {
    let returnable = <Box class="isUnavaivable">Ratavalvoja ei paikalla</Box>;
    return returnable;
  }
}

/*
 ** !!!REWRITE WHEN ROUTING WORKS
 */
function getParent() {
  return "/dayview";
}

/*
 ** Main function
 */
function Trackview() {
  let date = new Date(Date.now());

  return (
    /*    Whole view */
    <div class="wholeScreenDiv">
      {/*    Radan nimi ja kuvaus  */}
      <div class="trackNameAndType">
        <div>
          <h1>Rata 1</h1>
        </div>
        <div>
          <h3> Kivääri 200m</h3>
        </div>
      </div>

      {/*    Päivämäärä */}
      <div>
        <h2>
          {dayToString(date.getDay())} {date.toLocaleDateString("fi-FI")}
        </h2>
      </div>

      {/*    Päävalvojan ja ratavalvojan status  */}
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="left"
        spacing={1}
      >
        {/*   pyydetään metodeilta boxit joissa radan tila */}
        <Grid item xs={1} sm={6}>
          {rangeAvaivability(1)}
        </Grid>
        <Grid item xs={1} sm={6}>
          {trackAvaivability(0)}
        </Grid>
      </Grid>

      {/*    Infobox  */}

      <p>Lisätietoja:</p>
      <div class="infoBox">
        Did you know octopuses don’t have tentacles; they have arms. A tentacle
        only has suckers at its end, while a cephalopod arm has suckers for most
        of its length. Did u also know boomari arm have no sucker to make
        swinging easier. Ja jtn et 255 char täyteee
      </div>

      {/*    Linkki taaksepäin  */}
      <Link className="backLink" style={{ color: "black" }} to={getParent()}>
        <ArrowBackIcon />
        Päivänäkymään
      </Link>
    </div>
  );
}

export default Trackview;
