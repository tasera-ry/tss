import React, { Component } from "react";
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import { dayToString } from "./utils/Utils";

class Weekview extends Component {

    constructor(props) {
        super(props);
        this.state = {
          weekNro: 0
        };
    }

    //Updates week to current when page loads
    componentDidMount() {
        this.getWeek();
      }

    //Changes week number state to previous one
    previousWeekClick = () => {
        let previous;
        //Week logic cuz you can't go negative
        if (this.state.weekNro === 1 ) {
            previous = 52
        } else {
            previous = this.state.weekNro-1
        }
        this.setState({weekNro: previous})
    }

    //Changes week number state to next one
    nextWeekClick = () => {
        let previous;
        //Week logic cuz there's no 53 weeks
        if (this.state.weekNro === 52 ) {
            previous = 1
        } else {
            previous = this.state.weekNro+1
        }
        this.setState({weekNro: previous})
    }

    //Function for parsin current week number
    getWeek = () => {
        var date1 = new Date();
        date1.setHours(0, 0, 0, 0);
        date1.setDate(date1.getDate() + 3 - (date1.getDay() + 6) % 7);
        var week1 = new Date(date1.getFullYear(), 0, 4);
        var current = 1 + Math.round(((date1.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
        this.setState({weekNro: current})
        return current;
    }

    //Creates 7 columns for days
    createWeekDay = () => {

        //Date should come from be?
        let table = []
        let pv;
    
        for (let j = 1; j < 8; j++) {
            pv = dayToString(j);
            //Korjausliike ku utilsseis sunnuntai on eka päivä
            if (j === 7) {
                pv = "Sunnuntai"
            }
            table.push(
                <Link className="link">
                <p id ="weekDay">
                    {pv}
                </p>
                </Link>
                )
            }
        return table
    }

    //Creates 7 columns for days
    createDate = () => {

        //Date should come from be?
        var dateFromBackEnd = 1.1;
        let table = []
    
        for (let j = 0; j < 7; j++) {
            table.push(
                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateFromBackEnd}
                </p>
                </Link>
                )
            }
        return table
      }

    //Creates 7 columns for päävalvoja info, colored boxes
    createColorInfo = () => {

        //Color from be?
        //If blue, something is wrong
        let colorFromBackEnd = "blue"
        let table = []

        for (let j = 0; j < 7; j++) {
            colorFromBackEnd = "red"
            table.push(
                <Link style={{ backgroundColor: `${colorFromBackEnd}` }} class="link" to="/dayview">
                <p>
                &nbsp;
                </p>
                </Link>
                )
            }
        return table
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
                    <h1> Viikko {this.state.weekNro} </h1>
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
                <div className="klockan">
                    Aukiolo: 16-20 
                </div>
                <br></br>
                <Grid>
                    <div class="info-flex">
                        <div id="open-info" class='box'></div>
                        {/* Avoinna */} &nbsp;Avoinna <br></br> <br></br>
                        <div id="valvoja-info" class='box'></div>
                        {/* Päävalvoja tulossa */} &nbsp;Päävalvoja tulossa<br></br> <br></br>
                    </div>
                </Grid>
    
                {/* Bottom row */}
                <Grid class="bottom-info">
                    <div class="info-flex">
                        <div id="closed-info" class='box'></div>
                        {/* Suljettu */} &nbsp;Suljettu&nbsp; <br></br><br></br>
                        <div id="no-info" class='box'></div>
                        {/* Ei tietoa */} &nbsp;Ei tietoa
                    </div>
                </Grid>
                </div> 
            </div>
            
        );
    }
}

export default Weekview;