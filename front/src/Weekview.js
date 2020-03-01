import React from 'react';
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { monthToString } from "./utils/Utils";

function Weekview() {

    let date = new Date(Date.now());

    var currentYear = date.toLocaleDateString().split(".")[2];

    var dateNow = 1
    var monthNow = 1
    var yearNow = 2020

    var dayParams = "?q=" + dateNow + monthNow + yearNow;
    var dayUrl = "/dayview" + dayParams;

    return (
        <div class="container">
            {/* Header with arrows */}
            <Grid class="date-header">
                <h1> {monthToString(date.getMonth())} {currentYear}</h1>
            </Grid>

            {/* Date boxes */}
            <Grid class="flex-container2">
            <Link class="link" to={dayUrl}>
                <p style={{ fontSize: "medium" }}>
                {dateNow}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 1}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 2}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 3}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 4}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 5}.{monthNow}
                </p>    
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                {dateNow + 6}.{monthNow}
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

            
            {/* Infoboxes */}

            {/* Top row */}
            {/* To do: Tekstit ei toimi */}
            <Grid>
                <div class="info-flex">
                    <div id="open-info" class='box'></div>
                    {/* Avoinna */}
                    <div id="valvoja-info" class='box'></div>
                    {/* Päävalvoja tulossa */}
                </div>
            </Grid>

            {/* Bottom row */}
            <Grid class="bottom-info">
                <div class="info-flex">
                    <div id="closed-info" class='box'></div>
                    {/* Suljettu */}
                    <div id="no-info" class='box'></div>
                    {/* Ei tietoa */}
                </div>
            </Grid>
        </div>
    );
}

export default Weekview;