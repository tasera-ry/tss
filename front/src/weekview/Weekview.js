import React, { Component } from "react";

import '../App.css';
import './Weekview.css'

// Material UI components
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { getSchedulingWeek, getSchedulingDate } from "../utils/Utils";
import CircularProgress from '@material-ui/core/CircularProgress';
import InfoIcon from '@material-ui/icons/Info';

// Moment for date management
import moment from 'moment';

// Translation
import * as data from '../texts/texts.json';

let lang = "fi"; // fallback
if (localStorage.getItem("language") === '0') {
  lang = 'fi';
}
else if (localStorage.getItem("language") === '1'){
  lang = 'en';
}

const { week, weekdayShorthand } = data;
const fin = localStorage.getItem("language");

class Weekview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'loading',
      date: new Date(Date.now()),
      weekNro: 0,
      dayNro: 0,
      yearNro: 0,
    };

    this.previousWeekClick = this.previousWeekClick.bind(this);
    this.nextWeekClick = this.nextWeekClick.bind(this);
    this.update = this.update.bind(this);
  }

  // Updates week to current when page loads
  componentDidMount() {
    this.getWeek();
    this.getYear();
    this.update();
  }

  // Re-renders the component and fetches new data when the logo to frontpage is clicked on weekview
  componentWillReceiveProps() {
    this.setState({
      state: "loading"
    }, () => {
      this.getWeek();
      this.getYear();
      this.update();
    });
  }

  //Changes week number state to previous one
  previousWeekClick = (e) => {
    this.setState({
      state:'loading'
    })

    e.preventDefault();

    //Otetaan parametreistä päivät seuraavalle viikolle
    let uusPaiva;

    // I'm sure this part can be done easier
    try {
      const fullUrl = window.location.href.split("/");
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split("-")

      const paramYear = urlParamDateSplit[0]
      const paramMonth = urlParamDateSplit[1]
      const paramDay = urlParamDateSplit[2]

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")

      uusPaiva = moment(paramDateCorrect, "YYYYMMDD")
    }
    catch {
      uusPaiva = moment(this.state.dayNro, "YYYYMMDD")
    }

    uusPaiva.subtract(1, 'week')

    const uusViikko = uusPaiva.week();

    try {
      const oikeePaiva = new Date(this.state.date.setDate(this.state.date.getDate() - 7));
      this.props.history.replace("/weekview/" + moment(uusPaiva, "YYYYMMDD").add(1, 'day').toISOString());

      const viikkoNumero = moment(this.state.dayNro, "YYYYMMDD").week();

      // Week logic cuz you can't go negative
      const uusVuosi = viikkoNumero === 1
        ? this.state.yearNro - 1
        : this.state.yearNro

      this.setState(
        {
          date: oikeePaiva,
          dayNro: uusPaiva,
          weekNro: uusViikko,
          yearNro: uusVuosi
        },
        function() {
          this.update();
        }
      );
    } catch (error) {
      //console.log(error)
    }
  }

  //Changes week number state to next one
  nextWeekClick = (e) => {
    this.setState({
      state:'loading'
    })

    e.preventDefault();

    //Otetaan parametreistä päivät seuraavalle viikolle
    let uusPaiva;

    try {
      const fullUrl = window.location.href.split("/");
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split("-")

      const paramYear = urlParamDateSplit[0]
      const paramMonth = urlParamDateSplit[1]
      const paramDay = urlParamDateSplit[2]

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")

      uusPaiva = moment(paramDateCorrect, "YYYYMMDD")
    }
    catch {
      uusPaiva = moment(this.state.dayNro, "YYYYMMDD")
    }

    uusPaiva.add(1, 'week')
    const uusViikko = uusPaiva.week();

    try {
      const oikeePaiva = new Date(this.state.date.setDate(this.state.date.getDate() + 7));
      this.props.history.replace("/weekview/" + moment(uusPaiva, "YYYYMMDD").add(1, 'day').toISOString());

      // Week logic cuz there's no 53 weeks
      const uusVuosi = uusViikko === 1
        ? this.state.yearNro + 1
        : this.state.yearNro

      this.setState(
        {
          date: oikeePaiva,
          dayNro: uusPaiva,
          weekNro: uusViikko,
          yearNro: uusVuosi
        },
        function() {
          this.update();
        }
      );
    } catch(error) {
      //console.log(error)
    }
  }

  //Function for parsin current week number
  getWeek = () => {
    let date1 = new Date();
    date1.setHours(0, 0, 0, 0);
    date1.setDate(date1.getDate() + 3 - (date1.getDay() + 6) % 7);
    const week1 = new Date(date1.getFullYear(), 0, 4);
    const current = 1 + Math.round(((date1.getTime() - week1.getTime()) / 86400000
      - 3 + (week1.getDay() + 6) % 7) / 7);

    // Tää asettaa sen mikä viikkonumero on alotusnäytöllä
    // Nyt tarvis ottaa tähän url parametreistä se viikkonumero
    // Jos ei parametrejä nii sit toi current. Muuten parametrien

    // Urlista lasketaan oikee viikkonumero
    try {
      const fullUrl = window.location.href.split("/");
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split("-")

      const weeknumber = moment(urlParamDate, "YYYYMMDD").week();

      const paramDay = urlParamDateSplit[2]
      const paramMonth = urlParamDateSplit[1]
      const paramYear = urlParamDateSplit[0]

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")

      //Jos viikkonumero ei oo oikee laitetaan current
      if (isNaN(weeknumber)) {
        this.setState({weekNro: current})
        this.props.history.replace("/weekview/")
      }
      else {
        //Jos on oikee nii laitetaan url params
        this.setState({ weekNro: weeknumber, date: paramDateCorrect })
      }
    }
    catch {
      this.setState({ weekNro: current })
      this.props.history.replace("/weekview/")
    }

    return current;
  }

  //Creates 7 columns for days
  createWeekDay = () => {
    //Date should come from be?
    let table = []
    let oikeePaiva;
    let linkki;
    let dayNumber;

    if (this.state.paivat === undefined) {
      return;
    }

    for (let j = 0; j < 7; j++) {
      oikeePaiva = this.state.paivat[j].date
      linkki = "/dayview/" + oikeePaiva
      dayNumber = j.toString()

      table.push(
        <Link className="link" to={linkki}>
          <p id ="weekDay">
            {lang === 'en' ?
              weekdayShorthand[dayNumber][1] :
              weekdayShorthand[dayNumber][0]}
          </p>
        </Link>
      )
    }

    return table
  }

  // Creates 7 columns for days
  createDate = () => {
    let table = []

    if (this.state.paivat === undefined) {
      return;
    }

    let oikeePaiva;
    let fixed;
    let newDate;
    let linkki;

    for (let j = 0; j < 7; j++) {
      oikeePaiva = this.state.paivat[j].date
      fixed = oikeePaiva.split("-")
      newDate = fixed[2] + "." + fixed[1]

      linkki = "/dayview/" + oikeePaiva

      table.push(
        <Link class="link" to={linkki}>
          <p style={{ fontSize: "medium" }}>
            {newDate}
          </p>
        </Link>
      )
    }

    return table
  }

  // Creates 7 columns for päävalvoja info, colored boxes
  createColorInfo = () => {
    // Color from be?
    // If blue, something is wrong
    let colorFromBackEnd = "blue"
    let table = []

    if (this.state.paivat === undefined) {
      return;
    }

    let rataStatus;
    let oikeePaiva;
    let linkki;
    let Attention;
    let info;

    for (let j = 0; j < 7; j++) {
      //Luodaan väri
      rataStatus = this.state.paivat[j].rangeSupervision

      if (rataStatus === "present") {
        colorFromBackEnd = "#658f60"
      } else if (rataStatus === "confirmed") {
        colorFromBackEnd = "#b2d9ad"
      } else if (rataStatus === "not confirmed") {
        colorFromBackEnd = "#95d5db"
      } else if (rataStatus === "en route") {
        colorFromBackEnd = "#f2c66d"
      } else if (rataStatus === "closed") {
        colorFromBackEnd = "#c97b7b"
      } else if (rataStatus === "absent") {
        colorFromBackEnd = "#f2f0eb"
      }

      oikeePaiva = this.state.paivat[j].date
      info=false
      for (var key in this.state.paivat[j].tracks){
        Attention = this.state.paivat[j].tracks[key].notice
        if(Attention.length !== 0){
          info = true
        }
      }
      linkki = "/dayview/" + oikeePaiva
      table.push(
        <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link" to={linkki}>
          <p>
            {info ?
            <InfoIcon/>
            :
            <br />}
          </p>
        </Link>
      )
    }
    return table
  }

  getYear = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    this.setState({ yearNro: yyyy })
    return yyyy;
  }

  // TODO: update testi variables to more sensible names
  // The bug NFR01 also seems to be here
  update() {
    // /dayview/2020-02-20
    const date = this.props.match.params.date;
    const requestSchedulingDate = async () => {
      const response = await getSchedulingDate(date);

      if(response) {
        this.setState({
          date: new Date(response.date),
        });
      }
      else console.error("getting info failed");
    }

    requestSchedulingDate();

    let testi2;
    if (this.state.dayNro === 0) {
      let today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      const yyyy = today.getFullYear();

      today = yyyy + '-' + mm + '-' + dd;

      let testi = moment(yyyy + mm + dd, "YYYYMMDD")

      this.setState({
        dayNro: testi
      })

      testi2 = testi.format("YYYY-MM-DD")
    }
    else {
      testi2 = this.state.dayNro.format("YYYY-MM-DD")
    }

    let date1 = testi2;

    // ELI DATE1 PITÄÄ OLLA SE URLISTA TULEVA PARAM!!!!!!!!!!!

    let date2 = new Date();
    date2.setHours(0, 0, 0, 0);
    date2.setDate(date2.getDate() + 3 - (date2.getDay() + 6) % 7);
    const week1 = new Date(date2.getFullYear(), 0, 4);
    const current = 1 + Math.round(((date2.getTime() - week1.getTime()) / 86400000
      - 3 + (week1.getDay() + 6) % 7) / 7);

    // Tää asettaa sen mikä viikkonumero on alotusnäytöllä
    // Nyt tarvis ottaa tähän url parametreistä se viikkonumero
    // Jos ei parametrejä nii sit toi current. Muuten parametrien

    // Urlista lasketaan oikee viikkonumero
    try {
      const fullUrl = window.location.href.split("/");
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split("-")

      const weeknumber = moment(urlParamDate, "YYYYMMDD").week();

      const paramDay = urlParamDateSplit[2]
      const paramMonth = urlParamDateSplit[1]
      const paramYear = urlParamDateSplit[0]

      const paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")

      //Jos viikkonumero ei oo oikee laitetaan current
      if (isNaN(weeknumber)) {
        this.setState({ weekNro: current })
        //Tähän viel että parametriks tulee tän hetkinen viikko
        let now = moment().format();
        this.props.history.replace("/weekview/" + now)
      }
      else {
        //Jos on oikee nii laitetaan url params
        //dayNro pitäs saada parametrien mukaan oikeeks
        this.setState({ weekNro: weeknumber, date: paramDateCorrect, yearNro: paramYear })
        date1 = paramDateCorrect
      }
    }
    catch {
      this.setState({ weekNro: current })
      this.props.history.replace("/weekview/")
    }

    const requestSchedulingWeek = async () => {
      const response = await getSchedulingWeek(date1);

      if(response) {
        this.setState({
          //Tässä tehään päivät ja tän mukaan tulee se mikä on eka päivä
          paivat: response.week,
          state: 'ready'
        });
      }
      else console.error("getting info failed");
    }

    requestSchedulingWeek();
  }

  render() {
    return (
      <div>
        <div class="container">
          {/* Header with arrows */}
          <Grid class="date-header">
            <div
              className="hoverHand arrow-left"
              onClick={this.previousWeekClick}
            ></div>
            <h1> {week.Week[fin]} {this.state.weekNro} , {this.state.yearNro} </h1>
            {/* kuukausi jos tarvii: {monthToString(date.getMonth())} */}
            <div
              className="hoverHand arrow-right"
              onClick={this.nextWeekClick}
            ></div>
          </Grid>

          {/* Date boxes */}
          <Grid class="flex-container2">
            {this.createWeekDay()}
          </Grid>

          {/* Date boxes */}
          <Grid class="flex-container2">
            {this.state.state !== 'ready' ?
             "" :
             this.createDate()}
          </Grid>

          <div>
            {/* Colored boxes for dates */}
            {this.state.state !== 'ready' ?
              <div className="progress">
                <CircularProgress disableShrink/>
              </div>
              :
              <Grid class="flex-container">
                {this.createColorInfo()}
              </Grid>
            }
          </div>
        </div>

        {/* Infoboxes */}

        {/* Top row */}
        {/* To do: Tekstit ei toimi */}
        <hr></hr>
        <div className="infoContainer">
          <Grid>
            <div class="info-flex">

              <div id="open-info" class='box'></div>
              {/* Avoinna */} &nbsp;{week.Green[fin]} <br></br> <br></br>

              <div id="closed-info2" class='box'></div>
              {/* Suljettu */} &nbsp;{week.Blue[fin]} <br></br><br></br>

            </div>
          </Grid>

          {/* Bottom row */}
          <Grid class="bottom-info">
            <div class="info-flex">

              <div id="valvoja-info" class='box'></div>
              {/* Päävalvoja tulossa */} &nbsp;{week.Lightgreen[fin]} <br></br> <br></br>

              <div id="onway-info" class='box'></div>
              {/* Ei tietoa */}  &nbsp;{week.Orange[fin]}

            </div>
          </Grid>

          {/* Bottom row */}
          <Grid class="bottom-info">
            <div class="info-flex">

              <div id="closed-info" class='box'></div>
              {/* Suljettu */} &nbsp;{week.Red[fin]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br></br><br></br>

              <div id="no-info" class='box'> </div>
              {/* Ei tietoa */}  &nbsp;{week.White[fin]}

            </div>
          </Grid>
        </div>
      </div>
    );
  }
}

export default Weekview;
