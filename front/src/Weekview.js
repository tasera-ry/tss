import React from 'react';
import './App.css';
import './Weekview.css'
import {Link} from 'react-router-dom';

function test() {
    alert("function executed on clicking div");
  }

function Weekview() {

    var dateNow = 1
    var monthNow = 1
    var yearNow = 2020

    var dayParams = "?q=" + dateNow + monthNow + yearNow;
    var dayUrl = "/dayview" + dayParams;

    return (
        <div>
            <h1 class="week-header">Viikko 5, 2020</h1>

            <div>
            <div class="flex-container2">
                <Link class="link" to={dayUrl}>
                <p style={{ fontSize: "medium" }}>
                Ma {dateNow}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                Ti {dateNow + 1}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                Ke {dateNow + 2}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                To {dateNow + 3}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                Pe {dateNow + 4}.{monthNow}
                </p>
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                La {dateNow + 5}.{monthNow}
                </p>    
                </Link>

                <Link class="link" to="/dayview">
                <p style={{ fontSize: "medium" }}>
                Su {dateNow + 6}.{monthNow}
                </p>
                </Link>
            </div>
            </div>

            <div>
            <div class="flex-container">
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
            </div>
            </div>

            <div class="info-flex">
            <div class='box green'></div>
            &nbsp;Avoinna
            <div>
            <div class='box orange info-flex2'></div>
            &nbsp;Päävalvoja tulossa
            </div>
            </div>

            <div class="info-flex">
            <div>
            <div class='box red'></div>
            &nbsp;Suljettu&nbsp;
            </div>
            <div>
            <div class='box white info-flex2'></div>
            &nbsp;Ei tietoa 
            </div>
            </div>
        </div>
    );
}

export default Weekview;