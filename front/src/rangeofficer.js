import React, { Component } from "react";
import './App.css';
import './rangeofficer.css';
import Grid from '@material-ui/core/Grid';
import moment from 'moment'

import { dayToString } from "./utils/Utils";


class RangeOfficerView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            date: moment(Date.now()).format("YYYY-MM-DD"),
            tracksAvailable: null,
            rangeReservationId: null,
            scheduleId: null,
            setRangeSupervisor: null,
            openTime: 16,
            closeTime: 20,
            // Statuses: 0 = unavailable, 1 = present, 2 = closed, 3 = en route, 4 = confirmed, 5 = not confirmed
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
        this.update();
    }
    
    update(){
        var date = this.state.date;
        // TODO fetch info for current date
        fetch(`/api/reservation?date=${date}`)
            .then(res => res.json())
            .then(data => {
                // Should return table with only 1 object
                var firstData = data.pop();
                if ( firstData.available === true ) {
                    this.setState({
                        tracksAvailable: true,
                        rangeReservationId: firstData.id
                    }, () => {
                        fetch(`/api/schedule?range_reservation_id=${firstData.id}`)
                            .then(res => res.json())
                            .then(data2 => {
                                console.log(data2);
                                const timeData = data2[0];
                                // timeData.supervisor_id
                                this.setState({
                                    // This slicing might cause problems later
                                    openTime: timeData ? timeData.open.slice(0, 5) : 16,
                                    closeTime: timeData ? timeData.close.slice(0, 5) : 21, 
                                    scheduleId: timeData ? timeData.id : null,
                                    setRangeSupervisor: timeData ? timeData.supervisor_id : null,
                                }, () => {
                                    // Getting and setting track information
                                    fetch(`/api/date/${date}`)
                                        .then(res => res.json())
                                        .then(data => {
                                            console.log(data);
                                            const tracks = data.tracks;
                                            var i = 1;
                                            tracks.map(track => {
                                                // White status
                                                if (track.status === "absent") {
                                                    let trackNum = `track${i}`;
                                                    i++;

                                                    this.setState({
                                                        [trackNum]: 0
                                                    });
                                                }
                                                // Red status
                                                else if ( track.status === "closed" ) {
                                                    let trackNum = `track${i}`;
                                                    i++;

                                                    this.setState({
                                                        [trackNum]: 2
                                                    });
                                                }
                                                // Green status
                                                else if ( track.status === "trackofficer available" ) {
                                                    let trackNum = `track${i}`;
                                                    i++;

                                                    this.setState({
                                                        [trackNum]: 1
                                                    });
                                                }
                                            })
                                        });
                                })
                            });
                    });
                }
                else {
                    // TODO tracks not available (e.g. reserved for PV)
                    this.setState({
                        tracksAvailable: false
                    })
                }
            });
    }

    changeTrackStatus = (trackNum) => {
        let newStatus;
        if (this.state[trackNum] === 2) {
            newStatus = 0;
        }
        else if (this.state[trackNum] === 1) {
            newStatus = 2;
        }
        else if (this.state[trackNum] === 0) {
            newStatus = 1;
        }
        this.setState(
            {
                [trackNum]: newStatus
            }, () => {
                let num = trackNum.slice(-1);
                console.log(num);
                fetch(`/api/track-supervision/${this.state.reservationId}/${num}`, {
                    method: "PUT",
                    body: { "track_supervisor": "present"}
                })
                    .then(status => console.log(status));
            }
        );
    }

    changeStatusOpen = () => {
        this.setState(
            {
                officerStatus: 1
            }, () => {
                fetch(`/api/range-supervision/${this.state.reservationId}`, {
                    method: "PUT",
                    body: { "range_supervisor": "present"}
                })
                    .then(status => console.log(status));
            }
        );
    }

    changeStatusComing = () => {
        this.setState(
            {
                officerStatus: 3
            }, () => {
                // TODO save changed track officer status
                fetch(`/api/range-supervision/${this.state.reservationId}`, {
                    method: "PUT",
                    body: { "range_supervisor": "en route"}
                })
                    .then(status => console.log(status));
            }
        );
    }

    changeStatusClosed = () => {
        this.setState(
            {
                officerStatus: 2
            }, () => {
                // TODO save changed track officer status
                fetch(`/api/range-supervision/${this.state.reservationId}`, {
                    method: "PUT",
                    body: { "range_supervisor": "absent"}
                })
                    .then(status => console.log(status));
            }
        );
    }

    createOfficerStatus = () => {
        let newColor = "blue";
        let table = [];
        let status;

        if (this.state.officerStatus === 1) {
            newColor = "green";
            status = "paikalla";
        } 
        else if (this.state.officerStatus === 3) {
            newColor = "orange";
            status = "tulossa";
        } 
        else if (this.state.officerStatus === 2) {
            newColor = "red";
            status = "poissa";
        }
        else {
            newColor = "white";
            status = "ei asetettu";
        }

        table.push(
            <div style={{ backgroundColor: `${newColor}` }} className = "rangeOfficerStatus">
                Päävalvoja {status}
            </div>
            );
    return table;  
    }

    createTrackStatuses = () => {
        // If blue color is seen, something has gone wrong.
        let newColor = "blue";
        let table = [];
        let status;

        for ( var i = 1; i <= 7; i++ ) {
            let trackToChange = `track${i}`;

            if (this.state[trackToChange] === 1) {
                newColor = "green";
                status = "Paikalla";
            } 
            else if (this.state[trackToChange] === 0) {
                newColor = "white";
                status = "Vapaa, ei valvojaa";
            } 
            else if (this.state[trackToChange] === 2) {
                newColor = "red";
                status = "Poissa";
            }

            table.push(
                (<div 
                className = "changeTrack" 
                onClick={() => this.changeTrackStatus(trackToChange)}
                style={{ backgroundColor: `${newColor}` }}
                > {status} </div>)
            );
        }

        return table;
    }



    render() {
        console.log(this.state);

        return(
            <div className = "containsAll">

                <div className = "dateInfo">
                    <p> {dayToString(moment(this.state.date).format("d"))} {moment(this.state.date).format("DD.MM.YYYY")} </p>
                    <p> Aukiolo: {this.state.openTime}-{this.state.closeTime} </p>
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
                    {this.createTrackStatuses()}
                </div>

            </div>

        )
    }
}

export default RangeOfficerView;