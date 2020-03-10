import React, { Component } from "react";
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

class Weekview extends Component {

    constructor(props) {
        super(props);
        this.state = {
          weekNro: 0
        };
    }

    componentDidMount() {
        this.getWeek();
      }

    previousWeekClick = () => {
        let previous;
        if (this.state.weekNro == 1 ) {
            previous = 52
        } else {
            previous = this.state.weekNro-1
        }
        this.setState({weekNro: previous})
    }

    nextWeekClick = () => {
        let previous;
        if (this.state.weekNro == 52 ) {
            previous = 1
        } else {
            previous = this.state.weekNro+1
        }
        this.setState({weekNro: previous})
    }

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
                <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    1
                    </p>
                    </Link>
    
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    2
                    </p>
                    </Link>
    
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    3
                    </p>
                    </Link>
    
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    4
                    </p>
                    </Link>
    
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    5
                    </p>
                    </Link>
    
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    6
                    </p>    
                    </Link>
    
                    <Link class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    7
                    </p>
                    </Link>
                </Grid>
    
                <div>
                {/* Colored boxes for dates */}
                <Grid class="flex-container">
                    <Link style={{ backgroundColor: "orange" }} class="link" to="/dayview">
                    <p>
                    &nbsp;
                    </p>
                    </Link>
    
                    <Link style={{ backgroundColor: "green" }} class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    &nbsp;
                    </p>
                    </Link>
    
                    <Link style={{ backgroundColor: "red" }} class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    &nbsp;
                    </p>
                    </Link>
    
                    <Link style={{ backgroundColor: "green" }} class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    &nbsp;
                    </p>
                    </Link>
    
                    <Link style={{ backgroundColor: "white" }} class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    &nbsp;
                    </p>
                    </Link>
    
                    <Link style={{ backgroundColor: "green" }} class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    &nbsp;
                    </p>
                    </Link>
    
                    <Link style={{ backgroundColor: "red" }} class="link" to="/dayview">
                    <p style={{ fontSize: "medium" }}>
                    &nbsp;
                    </p>
                    </Link>
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
                        {/* Suljettu */} &nbsp;Suljettu <br></br><br></br>
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