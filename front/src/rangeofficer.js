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
            reservationId: null,
            scheduleId: null,
            rangeSupervision: null,
            rangeSupervisionScheduled: false,
            open: 16,
            close: 20,
            // Statuses: absent, present, closed, en route, confirmed, not confirmed
            rangeSupervision: 'absent',
            tracks:{},
            token:null,
            canUpdate:false
        };
    }

    componentDidMount() {
      console.log("MOUNTED",localStorage.getItem('token'));
      this.setState({
        token: localStorage.getItem('token')
      },function(){
        if(this.state.token === null){
          this.props.history.push("/");
        }
        else{
          try{
            this.update();
          }
          catch(error){
            console.error("init failed",error);
          }
        }
      })
    }

    update() {
        var date = this.state.date;
        // TODO fetch info for current date
        fetch(`/api/datesupreme/${date}`)
            .then(res => res.json())
            .then(response => {
                console.log("date",response);
                this.setState({
                    date: response.date,
                    rangeId: response.rangeId,
                    reservationId: response.reservationId,
                    scheduleId: response.scheduleId,
                    open: response.open !== null ? 
                      moment(response.open, 'h:mm:ss').format() :
                      moment(response.date)
                      .hour(0)
                      .minute(0)
                      .second(0),
                    close: response.close !== null ? 
                      moment(response.close, 'h:mm:ss').format() :
                      moment(response.date)
                      .hour(0)
                      .minute(0)
                      .second(0),
                    rangeSupervision: response.rangeSupervision,
                    rangeSupervisionScheduled: response.rangeSupervisionScheduled,
                    tracks: response.tracks
                },function(){
                  console.log("state after update",this.state)
                    if(this.state.reservationId === null && this.state.scheduleId === null){
                      alert("either/both reservation schedule missing");
                      this.setState({
                        canUpdate:false
                      })
                    }else{
                      this.setState({
                        canUpdate:true
                      })
                    }
                })
            });
    }

    changeTrackStatus = (key) => {
        console.log("change track status",key,this.state.tracks[key])
        let newStatus;
        if (this.state.tracks[key].trackSupervision === 'closed') {
            newStatus = 'absent';
        }
        else if (this.state.tracks[key].trackSupervision === 'absent') {
            newStatus = 'present';
        }
        else if (this.state.tracks[key].trackSupervision === 'present') {
            newStatus = 'closed';
        }
        
        let tracks = this.state.tracks;
        tracks[key] = {
          ...this.state.tracks[key],
          trackSupervision:newStatus
        };
        
        this.setState(
            {
                tracks: tracks
            }, () => {
                if(this.state.canUpdate){
                    if(this.state.tracks[key].scheduled){
                      fetch(`/api/track-supervision/${this.state.scheduleId}/${this.state.tracks[key].id}`, {
                          method: "PUT",
                          body: JSON.stringify({track_supervisor: newStatus}),
                          headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.state.token}`
                          }
                      })
                      .then(status => console.log(status));
                    }
                    else{
                      fetch(`/api/track-supervision`, {
                          method: "POST",
                          body: JSON.stringify({
                            scheduled_range_supervision_id:this.state.scheduleId,
                            track_id:this.state.tracks[key].id,
                            track_supervisor: newStatus
                          }),
                          headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.state.token}`
                          }
                      })
                      .then(status => console.log(status));
                    }
                }else console.error("cannot update some parts (reservation or schedule) missing");
            }
        );
    }

    changeStatusOpen = () => {
        this.setState(
            {
                rangeSupervision: 'present'
            }, () => {
                //reservation and schedule exist
                if(this.state.canUpdate){
                    //range supervision exists
                    if(this.state.rangeSupervisionScheduled){
                        fetch(`/api/reservation/${this.state.reservationId}`, {
                            method: "PUT",
                            body: JSON.stringify({available: true}),
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${this.state.token}`
                            }
                        })
                        .then(status => {
                          console.log(status)
                          fetch(`/api/range-supervision/${this.state.scheduleId}`, {
                              method: "PUT",
                              body: JSON.stringify({range_supervisor: 'present'}),
                              headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${this.state.token}`
                              }
                          })
                          .then(status => console.log(status));
                        });
                    }
                    else{
                        fetch(`/api/reservation/${this.state.reservationId}`, {
                            method: "PUT",
                            body: JSON.stringify({available: true}),
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${this.state.token}`
                            }
                        })
                        .then(status => {
                          console.log(status)
                          fetch(`/api/range-supervision`, {
                              method: "POST",
                              body: JSON.stringify({
                                scheduled_range_supervision_id:this.state.scheduleId,
                                range_supervisor: 'present'
                              }),
                              headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${this.state.token}`
                              }
                          })
                          .then(status => console.log(status));
                        });
                    }
                }else console.error("cannot update some parts (reservation or schedule) missing");
            }
        );
    }

    changeStatusComing = () => {
        this.setState(
            {
                rangeSupervision: 'en route'
            }, () => {
                //reservation and schedule exist
                if(this.state.canUpdate){
                    //range supervision exists
                    if(this.state.rangeSupervisionScheduled){
                        fetch(`/api/reservation/${this.state.reservationId}`, {
                            method: "PUT",
                            body: JSON.stringify({available: true}),
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${this.state.token}`
                            }
                        })
                        .then(status => {
                          console.log(status)
                          fetch(`/api/range-supervision/${this.state.scheduleId}`, {
                              method: "PUT",
                              body: JSON.stringify({range_supervisor: 'en route'}),
                              headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${this.state.token}`
                              }
                          })
                          .then(status => console.log(status));
                        });
                    }
                    else{
                        fetch(`/api/reservation/${this.state.reservationId}`, {
                            method: "PUT",
                            body: JSON.stringify({available: true}),
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${this.state.token}`
                            }
                        })
                        .then(status => {
                          console.log(status)
                          fetch(`/api/range-supervision`, {
                              method: "POST",
                              body: JSON.stringify({
                                scheduled_range_supervision_id:this.state.scheduleId,
                                range_supervisor: 'en route'
                              }),
                              headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${this.state.token}`
                              }
                          })
                          .then(status => console.log(status));
                        });
                    }
                }else console.error("cannot update some parts (reservation or schedule) missing");
            }
        );
    }

    changeStatusClosed = () => {
        this.setState(
            {
                rangeSupervision: 'closed'
            }, () => {
                if(this.state.canUpdate){
                    fetch(`/api/reservation/${this.state.reservationId}`, {
                        method: "PUT",
                        body: JSON.stringify({available: 'false'}),
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${this.state.token}`
                        }
                    })
                    .then(status => console.log(status));
                }else console.error("cannot update some parts (reservation or schedule) missing");
            }
        );
    }

    createOfficerStatus = () => {
        let newColor = "blue";
        let table = [];
        let status;

        if (this.state.rangeSupervision === 'present') {
            newColor = "green";
            status = "Päävalvoja paikalla";
        } 
        else if (this.state.rangeSupervision === 'en route') {
            newColor = "orange";
            status = "Päävalvoja tulossa";
        } 
        else if (this.state.rangeSupervision === 'closed') {
            newColor = "red";
            status = "Suljettu";
        }
        else if (this.state.rangeSupervision === 'confirmed') {
            newColor = "lightGreen";
            status = "Päävalvoja varmistettu";
        }
        else if (this.state.rangeSupervision === 'not confirmed') {
            newColor = "blue";
            status = "Päävalvoja ei varmistettu";
        }
        else {
            newColor = "white";
            status = "Päävalvoja ei asetettu";
        }

        table.push(
            <div style={{ backgroundColor: `${newColor}` }} className = "rangeOfficerStatus">
                {status}
            </div>
            );
    return table;  
    }

    createTrackList = () => {
      let items = [];
      for (var key in this.state.tracks) {
        items.push(
          <React.Fragment>
            <div className = "trackName">{this.state.tracks[key].name}</div>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          {items}
        </React.Fragment>
      );
    }

    createTrackStatuses = () => {
        // If blue color is seen, something has gone wrong.
        let newColor = "blue";
        let table = [];
        let status;

        for (var key in this.state.tracks) {
            let trackToChange = `${key}`;
            if (this.state.tracks[key].trackSupervision === 'present') {
                newColor = "green";
                status = "Paikalla";
            } 
            else if (this.state.tracks[key].trackSupervision === 'absent') {
                newColor = "white";
                status = "Vapaa, ei valvojaa";
            } 
            else if (this.state.tracks[key].trackSupervision === 'closed') {
                newColor = "red";
                status = "Suljettu";
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
                    <p> Aukiolo: {moment(this.state.open).format('H.mm')}-{moment(this.state.close).format('H.mm')} </p>
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
                    >  Suljettu </div>
                </div>
                <br></br><br></br><br></br>

                {/* Tähän 7 laatikkoa, jotka ovat ratojen päävalvojien statukset */}

                <div className="midInfo">
                    Vaihda ratavalvojien statuksia napauttamalla värejä alta
                </div>

                <br></br>

                <div className="midInfo">
                    {this.createTrackList()}
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