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
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/en-ca';
import * as data from './texts/texts.json'

//print drop down menus in rows
const DropDowns = (props) => {
  let fin = localStorage.getItem("language");
  let id = props.d;
  let obj = props.changes.find(o => o.date===id);
  let text = props.sv.Present[fin];
  let color = "white";
  if(obj.range_supervisor==="confirmed" || obj.range_supervisor==="en route") {
    text = props.sv.Confirmed[fin];
    color = "green";
  }
  if(obj.range_supervisor==="absent") {
    text = props.sv.Absent[fin];
    color = "red";
  }  
  const [buttonText, setButtonText] = useState(text);
  const [buttonColor, setButtonColor] = useState(color);
  const [anchorEl, setAnchorEl] = useState(null);
  const [disable, setDisable] = useState(buttonColor!=="green");
  
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
    //data to be sent is in info
    //empty info means date is not confirmed

    if(event.currentTarget.dataset.info==="") {
      setButtonText(props.sv.Present[fin])
      setButtonColor("white");
      setDisable(true);
      obj.range_supervisor = "not confirmed";
    }
    if(event.currentTarget.dataset.info==="y") {
      setButtonText(props.sv.Confirmed[fin])
      setButtonColor("green");
      setDisable(false);
      obj.range_supervisor = "confirmed";
    }
    if(event.currentTarget.dataset.info==="n") {
      setButtonText(props.sv.Absent[fin]);
      setButtonColor("red");
      setDisable(true);
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
          {props.sv.Present[fin]}
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="y">
          {props.sv.Confirmed[fin]}
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="n">
          {props.sv.Absent[fin]}
        </MenuItem>

      </Menu>

      &nbsp;
      {props.today===props.d ?
       <Check HandleChange={props.HandleChange} checked={props.checked} sv={props.sv} disable={disable} />
       : "" }

    </span>
  )
}

//prints matkalla-checkbox
const Check = ({HandleChange, checked, sv, disable}) => {
  let fin = localStorage.getItem("language");

  return (
    <>
      <FormControlLabel disabled={disable} control={
        <Checkbox
          checked={checked}
          style={{color:"orange"}}
        onChange={HandleChange}
        />}
                        label={sv.EnRoute[fin]} />
      
    </>
  )
}

//prints date info in rows
const Rows = ({HandleChange, changes, checked, setDone, sv}) => {
  const styleA = {
    padding:30,
    marginLeft:30,
    flexDirection:"row",
    display:"inline-flex",
    fontSize:18
  }

  if(localStorage.getItem("language") === "1") {
    moment.locale("en-ca");
  }
  
  setDone(true);
  
  function getWeekday(day) {
    day = moment(day).format('dddd')
    if(window.innerWidth<800) {
      return day.charAt(0).toUpperCase() + day.slice(1, 2);
    }
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
		             HandleChange={HandleChange} checked={checked} sv={sv}  />
                </div>  
               )
  )
}


//TODO: change config after relocating jwt
async function getId() {
  let name = localStorage.getItem("taseraUserName");
  console.log("username:", name);
  
  let token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  let query = "api/user?name=" + name;
  let response = await axios.get(query, config);
  //let response = await axios.get(query);
  
  let userID = response.data[0].id;
  console.log("userID:", userID);

  return userID;
}

//obtain date info
async function getReservations(res) {

  let today = moment().format().split("T")[0];
  
  for(let i=0; i<res.length; i++) {
    let query = "api/reservation?available=true&id=" + res[i].reservation_id;
    let response = await axios.get(query);
    if(response.data.length>0) {
      let d = moment(response.data[0].date).format("YYYY-MM-DD");
      res[i].date = d
    }
  }

  res = res.filter(obj => obj.date >= today);

  res.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  return res;
}

//obtain users schedule and range supervision states
async function getSchedule(setSchedules, setNoSchedule, setChecked, setDone) {
  let userID = await getId();  
  let res = [];
  let temp = [];

  let query = "api/schedule?supervisor_id=" + userID;
  let response = await axios.get(query);
  temp = temp.concat(response.data);

  for(let i=0; i<temp.length; i++) {
    let v = await temp[i];

    let rsquery = "api/range-supervision/" + v.id;
    let rsresponse = await axios.get(rsquery);

    //object id is schedule id
    let obj = {
      "userID": userID,
      "date": "",
      "id": v.id,
      "reservation_id": v.range_reservation_id,
      "range_supervisor": rsresponse.data[0].range_supervisor
    }

    res = await res.concat(obj);
  }
 
  if(res.length===0) {
    await setNoSchedule(true);
    await setDone(true);
    return;
  }

  res = await getReservations(res);
  setSchedules(res);
  setChecked(res[0].range_supervisor==="en route");

  console.log("scheduled for user: ", res.length)
  console.log(res)
}

const DialogWindow = () => {
  const [noSchedule, setNoSchedule] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const {sv} = data;

  //starting point
  useEffect(() => {
    getSchedule(setSchedules, setNoSchedule, setChecked, setDone);
  }, [])

  return (
    <div>
      <Logic schedules={schedules} setSchedules={setSchedules}
             noSchedule={noSchedule} checked={checked} setChecked={setChecked}
    done={done} setDone={setDone} sv={sv} />
    </div>
  )
}

//sends updated info to database
async function putSchedules(changes) {
  console.log("updating: ")
  console.log(changes);

  let token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  for(let i=0; i<changes.length; i++) {
    let id = changes[i].id;
    let query = "api/range-supervision/" + id;
    let s = changes[i].range_supervisor;
    await axios.put(query,
                    {
                      range_supervisor:s
                    }, config)
    
  }
}

//creates dialog-window
const Logic = ({schedules, setSchedules, noSchedule, checked,
                setChecked, done, setDone, sv}) => {
  const discardChanges = {
    color:"gray"
  }
                  
  const useStyles = makeStyles((theme) => ({
  root: {
    position:'relative',
    marginLeft:'50%'
  },
  }));
                  
  const classes = useStyles();

  const [open, setOpen] = useState(true);
  const [wait, setWait] = useState(false);                
  const fin = localStorage.getItem("language");
  let changes = [...schedules];

  const HandleChange = (event) => {
    setChecked(!checked)
  }

  async function HandleClose() {

    if(checked && changes[0].range_supervisor==="confirmed") {
      let today = moment().format().split("T")[0];
      let obj = changes.find(o => o.date===today);
      obj.range_supervisor = "en route";
      changes.map(o => (o.date===today ? obj : o))
    }
    if(!checked && changes[0].range_supervisor==="en route") {
      changes[0].range_supervisor="confirmed";
    }

    if(changes.length>0) {
      setWait(true);
      await putSchedules(changes);
    }
    
    setOpen(false)
    window.location.reload();
  }
  
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="otsikko"
        maxWidth='sm'
        fullWidth={true}>
        
      <DialogTitle id="otsikko">{sv.SC[fin]}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {noSchedule ? sv.No[fin] : ""}
            {done ? "" : sv.Wait[fin]}
          </DialogContentText>
        </DialogContent>

        {schedules.length!==0 ?
         <Rows HandleChange={HandleChange} changes={changes}
               checked={checked} setDone={setDone} sv={sv} />
         : ""}

        {wait ?
           <div className={classes.root}>
             <CircularProgress  />
           </div>
         : ""}

        <DialogActions>

          <Button
            variant='contained'
            onClick={()=> setOpen(false)}>
            {sv.Cancel[fin]}
          </Button>

          {done && !noSchedule ?
           <Button
             color='primary'
             variant='contained'
             onClick={HandleClose}>
             {sv.Save[fin]}
           </Button>
           : ""
          }

        </DialogActions>

      </Dialog>
    </div>
  )
}

export default DialogWindow
