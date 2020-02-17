import React from "react";
import "./App.css";
import "./Trackview.css";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Container } from "@material-ui/core";

function Trackview() {
  return (
    <div class="rataInfo">
      <div class="container rowContainer">
        <h1>Rata 1</h1>
        <h3 class="rataInfo goDown"> Kivääri 200m</h3>
      </div>
      <h2>Maanantai 01.01.2020</h2>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="left"
        spacing={1}
      >
        <Grid item xs={1} sm={6}>
          <Box bgcolor="green" color="black" p={2}>
            Päävalvoja Paikalla
          </Box>
        </Grid>
        <Grid item xs={1} sm={6}>
          <Box bgcolor="green" color="black" p={2}>
            Ratavalvoja Paikalla
          </Box>
        </Grid>
      </Grid>
      <container>
        <p>Lisätietoja:</p>
        <Box class="infoBox">
          Hirvitaulu rikki overflow: auto (or overflow-y: auto) is the correct
          way to go.
        </Box>
      </container>
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
