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

async function getColors(tracks) {
  const copy = [...tracks]
  
  for(let i=0; i<copy.length; i++) {
    if(copy[i].trackSupervision==="present") {copy[i].trackSupervision="green"}
    if(copy[i].trackSupervision==="closed") {copy[i].trackSupervision="red"}
    if(copy[i].trackSupervision==="absent") {copy[i].trackSupervision="white"}
  }

  console.log(copy)
  return copy;
}

const Rows = ({tracks, tablet, fin}) => {
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
                 
                 <Button
                   style={{backgroundColor:`${track.trackSupervision}`, borderRadius: 30, width: 100}}
                   size='medium'>
                   {track.trackSupervision}
                 </Button>
               </div>
              )
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
      setTracks(response.tracks);

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
    })
  
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
          style={{color:"black", backgroundColor:statusColor, borderRadius: 30, width: 250}}
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
          {tablet.Green[fin]}
        </Button>
        &nbsp;
        <Button
          style={{fontSize: 20, backgroundColor:'#f2c66d', borderRadius: 50, width:250, height:100}}
          size='large'
          variant='contained'>
          {tablet.Orange[fin]}
        </Button>
        &nbsp;
        <Button
          style={{fontSize: 20, backgroundColor:'#c97b7b', borderRadius: 50, width:250, height:100}}
          size='large'
          variant='contained'>
          {tablet.Red[fin]}
        </Button>
      </div>
      
      &nbsp;
      <Typography
        variant="body1"
        align="center">
        {tablet.HelperSecond[fin]}
      </Typography>


      <div>
        <Rows tracks={tracks} />
      </div>
      
    </div>
    
  )



}

export default Tabletview;
