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
          way to go. The problem is that your text area is taller than your div.
          The div ends up cutting off the textbox, so even though it looks like
          it should start scrolling when the text is taller than 159px it won't
          start scrolling until the text is taller than 400px which is the
          height of the textbox. Try this: http://jsfiddle.net/G9rfq/1/ I set
          overflow:auto on the text box, and made the textbox the same size as
          the div. Also I don't believe it's valid to have a div inside a label,
          the browser will render it, but it might cause some funky stuff to
          happen. Also your div isn't closed.
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
