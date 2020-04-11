import React, { Component } from "react";
import './App.css';
import './rangeofficer.css';
import { Button } from 'react-bootstrap';
import Grid from '@material-ui/core/Grid';
import { callApi } from "./utils/helper.js";
import moment from 'moment'

import { dayToString } from "./utils/Utils";


class RangeOfficerView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            date: moment(Date.now()).format("YYYY-MM-DD"),
            // Statuses: 0 = away, 1 = present, 2 = reserved, 3 = coming
            officerStatus: 0,
            track1: 0,
            track2: 0,
            track3: 0,
            track4: 0,
            track5: 0,
            track6: 0,
            track7: 0
        };
    }

    componentDidMount() {
        console.log(this.state.date);
        // TODO fetch info for current date
        fetch(`/api/reservation?date=${this.state.date}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
            });
    }

     changeTrackStatus = () => {
        var newStatus;
        if (this.state.trackStatus === "Poissa") {
            newStatus = "Paikalla"
        }
        else if (this.state.trackStatus === "Paikalla") {
            newStatus = "Tulossa"
        }
        else if (this.state.trackStatus === "Tulossa") {
            newStatus = "Poissa"
        }
        this.setState(
            {
                trackStatus: newStatus
            }
        );
    }

    changeStatusOpen = () => {
        var newStatus = "Paikalla";

        this.setState(
            {
                officerStatus: newStatus
            }
        );
    }

    changeStatusComing = () => {
        var newStatus = "Tulossa";
        
        this.setState(
            {
                officerStatus: newStatus
            }
        );
    }

    changeStatusClosed = () => {
        var newStatus = "Poissa";
        
        this.setState(
            {
                officerStatus: newStatus
            }
        );
    }

    createOfficerStatus = () => {

        //Color from be?
        //If blue, something is wrong
        let newColor = "blue"
        let table = []
        let status;

        if (this.state.officerStatus === "Paikalla") {
            newColor = "green"
            status = "paikalla"
        } else if (this.state.officerStatus === "Tulossa") {
            newColor = "orange"
            status = "tulossa"
        } else if (this.state.officerStatus === "Poissa") {
            newColor = "red"
            status = "poissa"
        }

        table.push(
            <div style={{ backgroundColor: `${newColor}` }} className = "rangeOfficerStatus">
                Päävalvoja {status}
            </div>
            ) 
    return table  
    }

    createTrackStatus = () => {

        let newColor = "blue";
        let table = [];
        let status;

        if (this.state.trackStatus === "Paikalla") {
            newColor = "green";
            status = "Paikalla";
        } else if (this.state.trackStatus === "Tulossa") {
            newColor = "orange";
            status = "Tulossa";
        } else if (this.state.trackStatus === "Poissa") {
            newColor = "red";
            status = "Poissa";
        }

        table.push(
            <div 
            className = "changeTrack" 
            onClick={this.changeTrackStatus}
            style={{ backgroundColor: `${newColor}` }}
            > {status} </div>
            )
    return table  
    }



    render() {
        return(
            <div className = "containsAll">

            <div className = "dateInfo">
                <p> {dayToString(moment(this.state.date).format("d"))} {moment(this.state.date).format("DD.MM.YYYY")} </p>
                <p> Aukiolo: 16-20 </p>
            </div>

            {/* Tähän yksi iso laatikko, joka näyttää päävalvojan statuksen */}

            {this.createOfficerStatus()}

            {/* Tähän alle kolme laatikkoa, joista valitaan päävalvojan status */}

            <div className="midInfo">
                Valitse päävalvojan status napauttamalla väriä alta
            </div>

            <div className="midInfo">
                <div 
                    className = "changeStatus"
                    onClick={this.changeStatusOpen}
                    style={{ backgroundColor: "green" }}
                >  Paikalla </div>

                <div 
                    className = "changeStatus"
                    onClick={this.changeStatusComing}
                    style={{ backgroundColor: "orange" }}
                >  Tulossa </div>

                <div 
                    className = "changeStatus"
                    onClick={this.changeStatusClosed}
                    style={{ backgroundColor: "red" }}
                >  Poissa </div>
            </div>
            <br></br><br></br><br></br>

            {/* Tähän 7 laatikkoa, jotka ovat ratojen päävalvojien statukset */}

            <div className="midInfo">
                Vaihda ratavalvojien statuksia napauttamalla värejä alta
            </div>

            <br></br>

            <div className="midInfo">
                <div className = "trackName">Rata 1 </div>
                <div className = "trackName"> Rata 2 </div>
                <div className = "trackName"> Rata 3 </div>
                <div className = "trackName"> Rata 4 </div>
                <div className = "trackName"> Rata 5 </div>
                <div className = "trackName"> Rata 6 </div>
                <div className = "trackName"> Rata 7 </div>
            </div>
            <br></br><br></br>
            <div className="midInfo">
                {this.createTrackStatus()}
                <div className = "changeTrack"> Paikalla </div>
                <div className = "changeTrack"> Paikalla </div>
                <div className = "changeTrack"> Paikalla </div>
                <div className = "changeTrack"> Paikalla </div>
                <div className = "changeTrack"> Paikalla </div>
                <div className = "changeTrack"> Paikalla </div>
            </div>

            </div>

        )
    }
}

export default RangeOfficerView;