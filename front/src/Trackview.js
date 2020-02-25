import React from "react";
import "./App.css";
import "./Trackview.css";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Container } from "@material-ui/core";

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
          <Box class="ggbox">Päävalvoja Paikalla</Box>
        </Grid>
        <Grid item xs={1} sm={6}>
          <Box class="ggbox">Ratavalvoja Paikalla</Box>
        </Grid>
      </Grid>

      {/*    Infobox  */}
      <container>
        <p>Lisätietoja:</p>
        <div class="infoBox">
          Hirvitaulu rikki overflow: auto (or overflow-y: auto) is the correct
          way to go. asdassdasdfopjwqefjpwdsjfjöldfdfjsjwfwn fdsa adfs sdf sdfds
          f adfa sdf
        </div>
      </container>

      {/*    Linkki taaksepäin  */}
      <Link class="link" to="/dayview">
        <p style={{ fontSize: "medium" }}>
          <ArrowBackIcon />
          Päivänäkymään
        </p>
      </Link>
    </div>
  );
}

export default Trackview;
