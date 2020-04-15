import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import axios from 'axios';
import moment from 'moment';

//TODO:
//toiminnallisuus sinänsä

//print drop down menus in rows
const DropDowns = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [buttonText, setButtonText] = useState("Vahvista saapuminen");
  const [buttonColor, setButtonColor] = useState("white");
  let id = props.d;
  
  const styleB = {
    left:270,
    position:"absolute"

  }
  const buttonStyle = {
    backgroundColor:`${buttonColor}`
  }
  const discardChanges = {
    color:"lightgray"
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const HandleClose = (event) => {
    //välitettävä tieto infossa ja päivämäärä id:ssa
    //jos info tyhjä ei varmennettavaa valvontaa kys päivälle

    let obj = props.changes.find(o => o.date===id);

    if(event.currentTarget.dataset.info==="") {
      setButtonText("Vahvista saapuminen")
      setButtonColor("white");
      obj.range_supervisor = "";
    }
    if(event.currentTarget.dataset.info==="y") {
      setButtonText("Saavun paikalle")
      setButtonColor("green");
      obj.range_supervisor = "confirmed";
    }
    if(event.currentTarget.dataset.info==="n") {
      setButtonText("En pääse paikalle");
      setButtonColor("red");
      obj.range_supervisor = "absent";
    }
    props.changes.map(o => (o.date===id ? obj : o))
    console.log(props.changes.find(o => o.date===id));
    
    setAnchorEl(null);
  }
  
  return (
    <span style={styleB}>
      
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        style={buttonStyle}>
        {buttonText}
      </Button>
      
      <Menu
        id={props.d}
        open={Boolean(anchorEl)}
        keepMounted
        anchorEl={anchorEl}
        onClose={HandleClose}>
        
        <MenuItem
          onClick={HandleClose}
          data-info=""
          style={discardChanges}>
          Vahvista saapuminen
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="y">
          Saavun paikalle
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="n">
          En pääse paikalle
        </MenuItem>

      </Menu>

      &nbsp;
      {props.today===props.d ?
       <Check HandleChange={props.HandleChange} />
       : "" }

    </span>
  )
}

//prints matkalla-checkbox
const Check = ({HandleChange}) => {
  return (
    <>
      <FormControlLabel control={<Checkbox
                                   style={{color:"orange"}}
                                   onChange={HandleChange}
                                 />}
                        label="Matkalla" />
    </>
  )
}

//prints date info in rows
const Rows = ({HandleChange, changes}) => {
  const styleA = {
    padding:30,
    marginLeft:30,
    flexDirection:"row",
    display:"inline-flex",
    fontSize:18
  }

  function getWeekday(day) {
    day = moment(day).format('dddd')
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  function getDateString(day) {
    let parts = day.split("-")
    return `${parts[2]}.${parts[1]}.${parts[0]}`
  }
  
  let today = moment().format().split("T")[0];

  return (   
    changes.map(d =>
                  <div key={d.date} style={styleA}>
                    {getWeekday(d.date)} {getDateString(d.date)}
		    <DropDowns d={d.date} today={today} changes={changes}
		               HandleChange={HandleChange}  />
                  </div>  
                 )
  )
}

//hakee mahdolliset varauspäivät
async function getReservations(userID, dates, setDates, setSchedules, get) {
  //viikkotiedot
  //ilmeisesti reservationista saa aina yhden päivän ennen firstia?
  //sitä ei huomioida
  let week = [];
  let first = moment().format().split("T")[0];
  let last = moment().add(17, 'days').format().split("T")[0];
  let query = "api/reservation?available=true&from=" + first + "&to=" + last;
  
  let response = await axios.get(query);

  for(let i=1; i<response.data.length; i++) {
    let date = response.data[i].date.split("T")[0];
    let obj = {"date": date,
               "id": response.data[i].id}
    week = week.concat(obj);
  }
  
  await setDates(week);
  getSchedule(week, userID, setSchedules);
}

//hakee aikataulun käyttäjän id:n ja varauslistan päivien id:n mukaan
async function getSchedule(week, userID, setSchedules) {
  let res = [];

  for(let i=0; i<week.length; i++) {
    let query = "api/schedule?range_reservation_id=" + week[i].id + "&supervisor_id=" + userID;
    let response = await axios.get(query);
    
    if(response.data.length!==0) {
      let obj = {
	"date": week[i].date,
	"id": response.data[0].id,
	"reservation_id": response.data[0].range_reservation_id,
	"range_supervisor": ""
      }
      
      res = res.concat(obj);
    }
  }

  console.log("scheduled for user: ", res.length)

  await setSchedules(res);
  
  if(res.length===0) {
    window.alert("Ei vahvistettavia valvontoja");
  }
}

//täältä aloitetaan hakemalla tarvittavaa tietoa
const DialogWindow = () => {
  const [dates, setDates] = useState([]); //päivät, jolloin rata käytössä
  const [schedules, setSchedules] = useState([]); //käyttäjän valvontavuorot
  let hasReserv = false; //käyttäjällä ei ole valvontoja tietyn ajan sisällä

  //testimuuttuja, vaihda tätä saadaksesi eri käyttäjien vuorot
  let userID = 46;

  useEffect(() => {
    getReservations(userID, dates, setDates, setSchedules);
  }, [])

  return (
    <div>
      {schedules.length>0 ? <Logic schedules={schedules} setSchedules={setSchedules} />
       : ""}
    </div>
  )
}

//täällä tapahtuu dialogi-ikkunan luominen
const Logic = ({schedules, setSchedules}) => {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  let changes = [...schedules];

  const HandleChange = (event) => {
    //checked kertoo onko käyttäjä matkalla
    setChecked(!checked)
  }

  const HandleClose = () => {
    //saatujen tietojen välitys ja ikkunan sulkeminen

    setOpen(false)

    if(checked) {
      let today = moment().format().split("T")[0];
      let obj = changes.find(o => o.date===today);
      obj.range_supervisor = "en route";
      changes.map(o => (o.date===today ? obj : o))
    }

    console.log("updating: ")
    console.log(changes);


    

  }
  
  return (
    <div>
      <Dialog
        open={open}
        onClose={()=> setOpen(false)}
        aria-labelledby="otsikko"
        maxWidth='sm'
        fullWidth={true}>
        
        <DialogTitle id="otsikko">Valvonnat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Varmista päävalvojan saapuminen:
          </DialogContentText>
        </DialogContent>

        <Rows HandleChange={HandleChange} changes={changes} />

        <DialogActions>
          <Button onClick={HandleClose}>
            Ok
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  )
}

export default DialogWindow
