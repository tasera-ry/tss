import React, { Component } from "react";
import "./App.css";
import "./Trackview.css";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { callApi } from "./utils/helper.js";
import { dayToString } from "./utils/Utils";
/*
 ** Main function
 */
class Trackview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(Date.now()),
      opens: 16,
      closes: 20,
      rangeOfficer: false,
      trackOfficer: false,
      info: "",
      parent: props.getParent,
      name: "rata 1",
      description: ""
    };
    this.update = this.update.bind(this);
  }
  componentDidMount() {
    this.update();
  }
  update() {
    // /dayview/2020-02-20
    let date = this.props.match.params.date;
    callApi("GET", "date/" + this.props.match.params.date + "/track/" + this.props.match.params.track  )
       .then(res => {
         //async joten tietoa päivittäessä voi välähtää Date.now antama
         //ennen haluttua tietoa
         this.setState({
           date: new Date(this.props.match.params.date),
           trackOfficer: res.track.trackOfficer,
           rangeOfficer: res.track.rangeOfficer,
           name: res.track.trackName,
           description: "(" + res.track.description + ")",
           info: res.track.trackNotice,
         });
       })
       .catch(err => console.log(err));
  }

  rangeAvailability(){
    if (this.state.rangeOfficer) {
      let returnable = <Box class="isAvaivable">Päävalvoja Paikalla</Box>;
      return returnable;
    }
    else {
      let returnable = <Box class="isUnavaivable">Päävalvoja ei paikalla</Box>;
      return returnable;
    }
  }

 trackAvailability() {
    if (this.state.trackOfficer) {
      let returnable = <Box class="isAvaivable">Ratavalvoja Paikalla</Box>;
      return returnable;
    }
    else {
      let returnable = <Box class="isUnavaivable">Ratavalvoja ei paikalla</Box>;
      return returnable;
    }
  }

  render(){

    //required for "this" to work in callback
    //alternative way without binding in constructor:
    this.update = this.update.bind(this);
    return(
      /*    Whole view */
      <div class="wholeScreenDiv">
        {/*    Radan nimi ja kuvaus  */}
        <div class="trackNameAndType">
          <div>
            <h1>{this.state.name}</h1>
          </div>
          <div>
            <h3> &nbsp;{this.state.description}</h3>
          </div>
        </div>
      
        {/*    Päivämäärä */}
        <div>
          <h2>
          {dayToString(this.state.date.getDay())} {this.state.date.toLocaleDateString("fi-FI")}
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
            {this.rangeAvailability()}
          </Grid>
          <Grid item xs={1} sm={6}>
          {this.trackAvailability()}
          </Grid>
        </Grid>
      
        {/*    Infobox  */}
      
        <p>Lisätietoja:</p>
        <div class="infoBox">
          {this.state.info}
        </div>
      
        {/*    Linkki taaksepäin  */}
        <Link className="backLink" style={{ color: "black" }} to={this.state.parent}>
          <ArrowBackIcon />
          Päivänäkymään
        </Link>
      </div>
    );
  }
}

export default Trackview;