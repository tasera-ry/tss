import React, { useState, useEffect } from "react";
import './App.css';
import './rangeofficer.css';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import * as data from './texts/texts.json';
import moment from 'moment'
import axios from 'axios';

import { dayToString } from "./utils/Utils";

async function getColors(tracks, setTracks) {
  const colors = {
    green: '#658f60',
    red: '#c97b7b',
    white: '#f2f0eb',
    orange: '#f2c66d'
  }
  const copy = [...tracks]
  
  for(let i=0; i<copy.length; i++) {
    let obj = copy[i];
    if(copy[i].trackSupervision==="present") {obj.color=colors.green}
    else if(copy[i].trackSupervision==="closed") {obj.color=colors.red}
    else if(copy[i].trackSupervision==="absent") {obj.color=colors.white}
    else if(copy[i].trackSupervision==="en route") {obj.color=colors.orange}
  }

  console.log(copy);
  setTracks(copy)
}

//shooting track rows
const TrackRows = ({tracks, tablet, fin}) => {
  const rangeStyle = {
    flexDirection: "center",
    display: "inline-block",
    alignItems: "center",
    textAlign: "center",
    justifyContents: "center",
    padding: 20,
    marginLeft: 15
  }


  

  return (
    tracks.map(track =>
               <div key={track.id} style={rangeStyle}>
                 
                 <Typography
                   align="center">
                   {track.name}
                 </Typography>

                 <TrackButtons track={track} tablet={tablet} fin={fin}/>

               </div>
              )
  )
}

const TrackButtons = ({track, tablet, fin}) => {

  let text = tablet.Present[fin];
  if (track.trackSupervision==="absent") { text = tablet.Absent[fin]; }
  else if (track.trackSupervision==="closed") { text = tablet.Closed[fin]; }

  return (
    
    <Button
      style={{backgroundColor:`${track.color}`, borderRadius: 30, width: 100}}
      size='medium'>
      {text}
    </Button>

  )
  
}

//haetaan oikea teksti päävalvojan ilmoitukseen
async function getData(tablet, fin, setHours, tracks, setTracks, setStatusText) {

  let date = moment(Date.now()).format("YYYY-MM-DD");

  await fetch(`/api/datesupreme/${date}`)
    .then(res => res.json())
    .then(response => {
      console.log(response)
      setHours([moment(response.open, 'h:mm').format('H.mm'),
                moment(response.close, 'h:mm').format('H.mm')]);

      if (response.rangeSupervision === 'present') {
        setStatusText(tablet.SuperGreen[fin]);
      } 
      else if (response.rangeSupervision === 'en route') {
        setStatusText(tablet.SuperOrange[fin]);
      } 
      else if (response.rangeSupervision === 'closed') {
        setStatusText(tablet.Red[fin]);
      }
      else if (response.rangeSupervision === 'confirmed') {
        setStatusText(tablet.SuperLightGreen[fin]);
      }
      else if (response.rangeSupervision === 'not confirmed') {
        setStatusText(tablet.SuperBlue[fin]);
      }
      else {
        setStatusText("Päävalvoja ei asetettu");
      }
      getColors(response.tracks, setTracks)
    }
	 )
  
  return "text";
}

//haetaan oikea väri päävalvojan ilmoitukseen
function getStatusColor() {
  return "green";
}

const Tabletview = () => {
  const [statusColor, settatusColor] = useState("#c97b7b");
  const [statusText, setStatusText] = useState();
  const [hours, setHours] = useState([]);
  const [tracks, setTracks] = useState([]);
  const fin = localStorage.getItem("language");
  const {tablet} = data;
  let today = moment().format("DD.MM.YYYY");

  useEffect(() => {
    getData(tablet, fin, setHours, tracks, setTracks, setStatusText);
    getStatusColor();
  }, []);


  const rowStyle = {
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    alignItems:"center"
  }
  const buttonStyle = {
    color: "black",
    backgroundColor: statusColor,
    borderRadius: 30,
    width: 250
  }

  return (
    <div>
      <Typography
        variant="body1"
        align="center">
        <br />
        {today}
      </Typography>
      <Typography
        variant="body1"
        align="center">
        {tablet.Open[fin]}: {hours[0]} - {hours[1]}
      </Typography>
      &nbsp;
      
      <div style={rowStyle}>
        <Button
          style={buttonStyle}
          size='large'
          fullwidth
          disabled>
          {statusText}
        </Button>
      </div>

      <Typography
        variant="body1"
        align="center">
        <br />
        {tablet.HelperFirst[fin]}
      </Typography>

      &nbsp;
      <div style={rowStyle}>
        <Button
          style={{fontSize: 20, backgroundColor: '#658f60', borderRadius: 50, width:250, height:100}}
          size='large'
          variant='contained'>
          {tablet.Present[fin]}
        </Button>
        &nbsp;
        <Button
          style={{fontSize: 20, backgroundColor:'#f2c66d', borderRadius: 50, width:250, height:100}}
          size='large'
          variant='contained'>
          {tablet.EnRoute[fin]}
        </Button>
        &nbsp;
        <Button
          style={{fontSize: 20, backgroundColor:'#c97b7b', borderRadius: 50, width:250, height:100}}
          size='large'
          variant='contained'>
          {tablet.Closed[fin]}
        </Button>
      </div>
      
      &nbsp;
      <Typography
        variant="body1"
        align="center">
        {tablet.HelperSecond[fin]}
      </Typography>


      <div>
      <TrackRows tracks={tracks} tablet={tablet} fin={fin} />
      </div>
      
    </div>
    
  )



}

export default Tabletview;
