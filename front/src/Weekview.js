import React, { Component } from "react";
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { dayToString, getSchedulingWeek, getSchedulingDate } from "./utils/Utils";
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import moment from 'moment'
import * as data from './texts/texts.json'

let lang = "fi"; //fallback
if(localStorage.getItem("language") === '0') {
  lang = 'fi';
}
else if(localStorage.getItem("language") === '1'){
  lang = 'en';
}

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

    //Updates week to current when page loads
    componentDidMount() {
        this.getWeek();
        this.getYear();
        this.update();
      }

    //Changes week number state to previous one
    previousWeekClick = (e) => {

        this.setState({
            state:'loading'
        })

        e.preventDefault();

        //Otetaan parametreistä päivät seuraavalle viikolle
        let testi;
        try {
            let fullUrl = window.location.href.split("/");
            let urlParamDate = fullUrl[5];

            let urlParamDateSplit = urlParamDate.split("-")

            var weeknumber = moment(urlParamDate, "YYYYMMDD").week();
            var daynumber = moment(urlParamDate, "YYYYMMDD").day();

            let paramDay = urlParamDateSplit[2]
            let paramMonth = urlParamDateSplit[1]
            let paramYear = urlParamDateSplit[0]


            let paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")
            //console.log("paramDateCorrect: " + paramDateCorrect)

            testi = moment(paramDateCorrect, "YYYYMMDD")
        }
        catch {
            testi = moment(this.state.dayNro, "YYYYMMDD")
        }
        
        testi.subtract(1, 'week')

        let uusViikko = testi.week();

        //alert(this.props.match.params.date);
        //alert(this.state.date);

        //let oikeePaiva = this.state.paivat[3].date
        //this.props.history.replace("/weekview/" + oikeePaiva );

        let oikeePaiva = new Date(this.state.date.setDate(this.state.date.getDate() - 7));
        this.props.history.replace("/weekview/" + testi.toISOString());

        let previous;
        let yyyy;

        let testiViikko = moment(this.state.dayNro, "YYYYMMDD");
        //testiViikko.add(1,'week');
        let testiViikkoNumero = testiViikko.week();

        //Week logic cuz you can't go negative
        if (testiViikkoNumero === 1 ) {
            yyyy = this.state.yearNro-1
        } else {
            yyyy = this.state.yearNro
        }
        this.setState(
            {
              date: oikeePaiva,
              dayNro: testi,
              weekNro: uusViikko,
              yearNro: yyyy
            },
            function() {
              this.update();
            }
        );
    }

    //Changes week number state to next one
    nextWeekClick = (e) => {

        this.setState({
            state:'loading'
        })

        e.preventDefault();

        //Otetaan parametreistä päivät seuraavalle viikolle
        let testi;
        try {
            let fullUrl = window.location.href.split("/");
            let urlParamDate = fullUrl[5];

            let urlParamDateSplit = urlParamDate.split("-")

            var weeknumber = moment(urlParamDate, "YYYYMMDD").week();
            var daynumber = moment(urlParamDate, "YYYYMMDD").day();

            let paramDay = urlParamDateSplit[2]
            let paramMonth = urlParamDateSplit[1]
            let paramYear = urlParamDateSplit[0]


            let paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")
            //console.log("paramDateCorrect: " + paramDateCorrect)

            testi = moment(paramDateCorrect, "YYYYMMDD")
        }
        catch {
            testi = moment(this.state.dayNro, "YYYYMMDD")
        }

        //LOPPU


        //console.log("dayNro statessa: " + this.state.dayNro)
        //console.log("Testi statessa: " + testi)
        
        testi.add(1, 'week')

        let uusViikko = testi.week();

        let oikeePaiva = new Date(this.state.date.setDate(this.state.date.getDate() + 7));

        this.props.history.replace("/weekview/" + testi.toISOString());

        let previous;
        let yyyy;
        //Week logic cuz there's no 53 weeks
        if (uusViikko === 1 ) {
            yyyy = this.state.yearNro+1
        } else {
            yyyy = this.state.yearNro
        }
        this.setState(
            {
              date: oikeePaiva,
              dayNro: testi,
              weekNro: uusViikko,
              yearNro: yyyy
            },
            function() {
              this.update();
            }
        );
    }

    //Function for parsin current week number
    getWeek = () => {
        var date1 = new Date();
        date1.setHours(0, 0, 0, 0);
        date1.setDate(date1.getDate() + 3 - (date1.getDay() + 6) % 7);
        var week1 = new Date(date1.getFullYear(), 0, 4);
        var current = 1 + Math.round(((date1.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);

        //Tää asettaa sen mikä viikkonumero on alotusnäytöllä
        //Nyt tarvis ottaa tähän url parametreistä se viikkonumero
        //Jos ei parametrejä nii sit toi current. Muuten parametrien

        //Urlista lasketaan oikee viikkonumero
        try {
            let fullUrl = window.location.href.split("/");
            let urlParamDate = fullUrl[5];
    
            let urlParamDateSplit = urlParamDate.split("-")
    
            var weeknumber = moment(urlParamDate, "YYYYMMDD").week();
            var daynumber = urlParamDate

            let paramDay = urlParamDateSplit[2]
            let paramMonth = urlParamDateSplit[1]
            let paramYear = urlParamDateSplit[0]
    
            let paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")
            //console.log("paramDateCorrect: " + paramDateCorrect)

            var timeInMilliseconds = moment(urlParamDate).valueOf();
    
            //Jos viikkonumero ei oo oikee laitetaan current
            if (isNaN(weeknumber)) {
                this.setState({weekNro: current}) 
                this.props.history.replace("/weekview/")
            }
            else {
            //Jos on oikee nii laitetaan url params
            //miksei date settaannu!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            this.setState({weekNro: weeknumber, date: paramDateCorrect})
            //console.log(this.state.date);
            }   
        }
        catch {
            this.setState({weekNro: current})
            this.props.history.replace("/weekview/")
        }

        return current;
    }

    //Creates 7 columns for days
    createWeekDay = () => {

        //Date should come from be?
        let table = []
        let pv;
        let oikeePaiva;
        let linkki;
    
        if (this.state.paivat === undefined) {
            
        }
        else {
            for (let j = 1; j < 8; j++) {
                pv = dayToString(j);
                //Korjausliike ku utilsseis sunnuntai on eka päivä
                if (j === 1) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Mon";
                    } else {
                        pv = "Ma"; 
                    }
                }
                if (j === 2) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Tue";
                    } else {
                        pv = "Ti"; 
                    }
                }
                if (j === 3) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Wed";
                    } else {
                        pv = "Ke"; 
                    }
                }
                if (j === 4) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Thu";
                    } else {
                        pv = "To"; 
                    }
                }
                if (j === 5) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Fri";
                    } else {
                        pv = "Pe"; 
                    }
                }
                if (j === 6) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Sat";
                    } else {
                        pv = "La"; 
                    }
                }
                if (j === 7) {
                    if (localStorage.getItem("language") === '1') {
                        pv = "Sun";
                    } else {
                        pv = "Su"; 
                    }
                }
                j--;
                oikeePaiva = this.state.paivat[j].date
                j++;
                linkki = "/dayview/" + oikeePaiva
    
                table.push(
                    <Link className="link" to={linkki}>
                    <p id ="weekDay">
                        {pv}
                    </p>
                    </Link>
                    )
                }
            return table
        }
    }

    //Creates 7 columns for days
    createDate = () => {

        let table = []

        if (this.state.paivat === undefined) {
            
        }
        else {
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
      }

    //Creates 7 columns for päävalvoja info, colored boxes
    createColorInfo = () => {

        //Color from be?
        //If blue, something is wrong
        let colorFromBackEnd = "blue"
        let table = []

        if (this.state.paivat === undefined) {
            
        }
        else {
            let rataStatus;
            let oikeePaiva;
            let linkki;
            for (let j = 0; j < 7; j++) {

                //Luodaan väri 

                rataStatus = this.state.paivat[j].rangeSupervision
                //console.log("ratastatus",rataStatus);

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
                linkki = "/dayview/" + oikeePaiva
                table.push(
                    <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link" to={linkki}>
                    <p>
                    &nbsp;
                    </p>
                    </Link>
                    )
                }   
            return table  
        }
    }

    getYear = () => {
        let today = new Date();
        let yyyy = today.getFullYear();
        this.setState({yearNro: yyyy})
        return yyyy;
    }

    update() {

        // /dayview/2020-02-20
        let date = this.props.match.params.date;
        const request1 = async () => {
        const response1 = await getSchedulingDate(date);

        if(response1 !== false){
            //console.log("Results from api",response1);

            this.setState({
            date: new Date(response1.date),
            });
        } else console.error("getting info failed");
        } 
        request1();

        let testi2;
        if (this.state.dayNro === 0) {
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();
    
            today = yyyy + '-' + mm + '-' + dd;

            let testi = moment(yyyy + mm + dd, "YYYYMMDD")

            this.setState({
                dayNro: testi
            })
            //console.log("tanaan on " + testi.format('L'))
            testi2 = testi.format("YYYY-MM-DD")
        }
        else {
            testi2 = this.state.dayNro.format("YYYY-MM-DD")
        }

        let date1 = testi2;

        // ELI DATE1 PITÄÄ OLLA SE URLISTA TULEVA PARAM!!!!!!!!!!!
        
        var date2 = new Date();
        date2.setHours(0, 0, 0, 0);
        date2.setDate(date2.getDate() + 3 - (date2.getDay() + 6) % 7);
        var week1 = new Date(date2.getFullYear(), 0, 4);
        var current = 1 + Math.round(((date2.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);

        //Tää asettaa sen mikä viikkonumero on alotusnäytöllä
        //Nyt tarvis ottaa tähän url parametreistä se viikkonumero
        //Jos ei parametrejä nii sit toi current. Muuten parametrien

        //Urlista lasketaan oikee viikkonumero
        try {
            let fullUrl = window.location.href.split("/");
            let urlParamDate = fullUrl[5];
    
            let urlParamDateSplit = urlParamDate.split("-")
    
            var weeknumber = moment(urlParamDate, "YYYYMMDD").week();
            var daynumber = moment(urlParamDate, "YYYYMMDD").day();

            let paramDay = urlParamDateSplit[2]
            let paramMonth = urlParamDateSplit[1]
            let paramYear = urlParamDateSplit[0]

            //Parametrinä olevan ajan antaa millisekunteina
            var timeInMilliseconds = moment(urlParamDate).valueOf();
            //console.log("Parametrinä annetun päivämäärän millisekuntit: " + timeInMilliseconds)
    
            let paramDateCorrect = moment(paramYear + paramMonth + paramDay, "YYYYMMDD")
            //console.log("paramDateCorrect: " + paramDateCorrect)
    
            //Jos viikkonumero ei oo oikee laitetaan current
            if (isNaN(weeknumber)) {
                this.setState({weekNro: current})
                //Tähän viel että parametriks tulee tän hetkinen viikko 
                let now = moment().format();
                this.props.history.replace("/weekview/" + now)
            }
            else {
            //Jos on oikee nii laitetaan url params
            //miksei date settaannu!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //dayNro pitäs saada parametrien mukaan oikeeks
            this.setState({weekNro: weeknumber, date: paramDateCorrect, yearNro: paramYear})
            date1 = paramDateCorrect
            }   
        }
        catch {
            this.setState({weekNro: current})
            this.props.history.replace("/weekview/")
        }

        

        // JUU YLEMPI HYVÄ

        const request = async () => {
          const response = await getSchedulingWeek(date1);

          if(response !== false){
            //console.log("Results from api",response);

            //console.log("response.week = " + response.week)
            this.setState({
              //Tässä tehään päivät ja tän mukaan tulee se mikä on eka päivä
              paivat:response.week,
              state:'ready'
            });
          } else console.error("getting info failed");
        } 
        request();

        //let oikeePaiva = new Date(this.state.date.setDate(this.state.date.getDate()));
        //this.props.history.replace("/weekview/" + oikeePaiva.toISOString());
        //alert(oikeePaiva.toISOString());
      }

  render() {
    const {week} = data;
    const fin = localStorage.getItem("language");

        return (
            
        <div>
            <div class="container">

            <Modal open={this.state.state!=='ready'?true:false}>
                <Backdrop open={this.state.state!=='ready'?true:false}>
                    <CircularProgress disableShrink />
                </Backdrop>
            </Modal>

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
                    {this.createDate()}
                </Grid>
    
                <div>
                {/* Colored boxes for dates */}
                <Grid class="flex-container">
                    {this.createColorInfo()}
                </Grid>
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


                        <div id="no-info" class='box'></div>
                      {/* Ei tietoa */} &nbsp;{week.White[fin]}

                    </div>
                </Grid>


                {/* Bottom row */}
                <Grid class="bottom-info">
                    <div class="info-flex">


                        <div id="closed-info" class='box'></div>
                        {/* Suljettu */} &nbsp;{week.Red[fin]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br></br><br></br>

                        <div id="onway-info" class='box'> </div>
                        {/* Ei tietoa */} &nbsp;Keskus suljettu

                    </div>
                </Grid>
                </div> 
            </div>
            
        );
    }
}

export default Weekview;
