import React, { useState, useEffect } from 'react';

// Material UI components
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

import { useCookies } from 'react-cookie';

// Axios for call-handling to backend
import axios from 'axios';

// Moment for date handling
import moment from 'moment';
import 'moment/locale/en-ca';

// Translations
import data from '../texts/texts.json';

// Styles
const dialogStyle = {
  backgroundColor: '#f2f0eb',
};
const discardChanges = {// eslint-disable-line
  color: 'gray',
};
const checkboxStyle = {
  color: '#f2c66d',
};
const styleA = {
  padding: 25,
  textAlign: 'center',
};
const useStyles = makeStyles((theme) => ({ // eslint-disable-line
  root: {
    position: 'relative',
    marginLeft: '50%',
  },
}));

/*
  LoggedIn.js is the component for accepting and denying upcoming supervision turns
*/

// print drop down menus in rows
const DropDowns = (props) => {
  const fin = localStorage.getItem('language');
  const id = props.d;
  const obj = props.changes.find((o) => o.date === id);
  let text = props.sv.Present[fin];
  let color = '#f2f0eb';
  if (obj.range_supervisor === 'confirmed' || obj.range_supervisor === 'en route') {
    text = props.sv.Confirmed[fin];
    color = '#658f60';
  }
  if (obj.range_supervisor === 'absent') {
    text = props.sv.Absent[fin];
    color = '#c97b7b';
  }
  const [buttonText, setButtonText] = useState(text);
  const [buttonColor, setButtonColor] = useState(color);
  const [anchorEl, setAnchorEl] = useState(null);
  const [disable, setDisable] = useState(buttonColor !== '#658f60');

  const buttonStyle = {
    width: 180,
    backgroundColor: `${buttonColor}`,
  };
  const discardChanges = { // eslint-disable-line
    color: '#b0aca0',
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const HandleClose = (event) => {
    // data to be sent is in info
    // empty info means date is not confirmed

    if (event.currentTarget.dataset.info === '') {
      setButtonText(props.sv.Present[fin]);
      setButtonColor('#f2f0eb');
      setDisable(true);
      obj.range_supervisor = 'not confirmed';
    }
    if (event.currentTarget.dataset.info === 'y') {
      setButtonText(props.sv.Confirmed[fin]);
      setButtonColor('#658f60');
      setDisable(false);
      obj.range_supervisor = 'confirmed';
    }
    if (event.currentTarget.dataset.info === 'n') {
      setButtonText(props.sv.Absent[fin]);
      setButtonColor('#c97b7b');
      setDisable(true);
      obj.range_supervisor = 'absent';
    }
    props.changes.map((o) => (o.date === id ? obj : o));
    // console.log(props.changes.find(o => o.date===id));

    setAnchorEl(null);
  };

  return (
    <span>
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        style={buttonStyle}
      >
        {buttonText}
      </Button>
      <Menu
        id={props.d}
        open={Boolean(anchorEl)}
        keepMounted
        anchorEl={anchorEl}
        onClose={HandleClose}
      >
        <MenuItem
          onClick={HandleClose}
          data-info=""
          style={discardChanges}
        >
          {props.sv.Present[fin]}
        </MenuItem>
        <MenuItem
          onClick={HandleClose}
          data-info="y"
        >
          {props.sv.Confirmed[fin]}
        </MenuItem>
        <MenuItem
          onClick={HandleClose}
          data-info="n"
        >
          {props.sv.Absent[fin]}
        </MenuItem>
      </Menu>
      &nbsp;
      {props.today === props.d
        ? (
          <Check
            HandleChange={props.HandleChange}
            checked={props.checked}
            sv={props.sv}
            disable={disable}
          />
        )
        : '' }
    </span>
  );
};

// prints matkalla-checkbox
const Check = ({
  HandleChange, checked, sv, disable,
}) => {
  const fin = localStorage.getItem('language');

  return (
    <>
      <br />
      <FormControlLabel
        label={sv.EnRoute[fin]}
        disabled={disable}
        control={(
          <Checkbox
            checked={checked}
            style={checkboxStyle}
            onChange={HandleChange}
          />
      )}
      />
    </>
  );
};

// prints date info in rows
const Rows = ({
  HandleChange, changes, checked, setDone, sv,
}) => {
  const language = localStorage.getItem('language');
  let num = 2;
  if (language === '1') {
    moment.locale('en-ca');
    num = 3;
  }

  setDone(true);

  function getWeekday(day) {
    day = moment(day).format('dddd'); // eslint-disable-line
    if (window.innerWidth < 800) {
      return day.charAt(0).toUpperCase() + day.slice(1, num);
    }
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  function getDateString(day) {
    const parts = day.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  const today = moment().format().split('T')[0];

  return (
    changes.map((d) => (
      <div key={d.date} style={styleA}>
        {getWeekday(d.date)}
        {' '}
        {getDateString(d.date)}
        {' '}
&nbsp;
        <DropDowns
          d={d.date}
          today={today}
          changes={changes}
          HandleChange={HandleChange}
          checked={checked}
          sv={sv}
        />
      </div>
    ))
  );
};

// TODO: change config after relocating jwt
// TODO: try to somehow check this alongside request
async function getId(username) {
  if (!username) return;

  const query = `api/user?name=${username}`;
  const response = await axios.get(query);

  const userID = response.data[0].id;

  return userID; // eslint-disable-line
}

// obtain date info
async function getReservations(res, setNoSchedule) { // eslint-disable-line
  const today = moment().format().split('T')[0];

  for (let i = 0; i < res.length; i += 1) {
    const query = `api/reservation?available=true&id=${res[i].reservation_id}`;
    const response = await axios.get(query);
    if (response.data.length > 0) {
      const d = moment(response.data[0].date).format('YYYY-MM-DD');
      res[i].date = d;
    }
  }

  res = res.filter((obj) => obj.date >= today); // eslint-disable-line

  res.sort((a, b) => new Date(a.date) - new Date(b.date));

  return res;
}

async function checkSupervisorReservations(username) {
  const userID = await getId(username);

  if (!userID) {
    return false;
  }

  // TODO: Make it be in form ?id=
  const query = `api/range-supervision/usersupervisions/${userID}`;

  const response = await axios.get(query)
    .then((response) => ( // eslint-disable-line
      // check and return boolean about whether there's any unconfirmed reservations
      response.data.some((sprvsn) => sprvsn.range_supervisor === 'not confirmed')))
    .catch((error) => {
      console.log(error);
    });

  return response;
}

// obtain users schedule and range supervision states
async function getSchedule(setSchedules, setNoSchedule, setChecked, setDone, username) {
  const userID = await getId(username);
  let res = [];
  let temp = [];

  const query = `api/schedule?supervisor_id=${userID}`;
  const response = await axios.get(query) // eslint-disable-line
    .then((response) => { // eslint-disable-line
      if (response) {
        temp = temp.concat(response.data);
      }
    })
    .catch((error) => { // eslint-disable-line
      // console.log(error);
    });

  for (let i = 0; i < temp.length; i += 1) {
    const v = await temp[i];

    const rsquery = `api/range-supervision/${v.id}`;
    await axios.get(rsquery)
      .then((response) => { // eslint-disable-line
        if (response) {
          // object id is schedule id
          const obj = {
            userID,
            date: '',
            id: v.id,
            reservation_id: v.range_reservation_id,
            range_supervisor: response.data[0].range_supervisor,
          };

          res = res.concat(obj);
        }
      })
      .catch((error) => { // eslint-disable-line
        // console.log(error);
      });
  }

  res = await getReservations(res, setNoSchedule);

  if (res.length === 0) {
    await setNoSchedule(true);
    await setDone(true);
    return;
  }

  setSchedules(res);
  setChecked(res[0].range_supervisor === 'en route');
}

const DialogWindow = ({ onCancel }) => {
  const [noSchedule, setNoSchedule] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const [cookies] = useCookies(['username']);
  const { sv } = data;

  if (onCancel === undefined) {
    onCancel = () => {}; // eslint-disable-line
  }

  // starting point
  useEffect(() => {
    getSchedule(setSchedules, setNoSchedule, setChecked, setDone, cookies.username);
  }, []);

  return (
    <div>
      <Logic
        schedules={schedules}
        setSchedules={setSchedules}
        noSchedule={noSchedule}
        checked={checked}
        setChecked={setChecked}
        done={done}
        setDone={setDone}
        sv={sv}
        onCancel={onCancel}
      />
    </div>
  );
};

// sends updated info to database
async function putSchedules(changes) {
  for (let i = 0; i < changes.length; i += 1) {
    const { id } = changes[i];
    const query = `api/range-supervision/${id}`;
    const s = changes[i].range_supervisor;
    await axios.put(query,
      {
        range_supervisor: s,
      });
  }
}

// creates dialog-window
const Logic = ({
  schedules,
  noSchedule,
  checked,
  setChecked,
  done,
  setDone,
  sv,
  onCancel,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [wait, setWait] = useState(false);
  const fin = localStorage.getItem('language');
  const changes = [...schedules];

  const HandleChange = (event) => { // eslint-disable-line
    setChecked(!checked);
  };

  async function HandleClose() {
    if (checked && changes[0].range_supervisor === 'confirmed') {
      const today = moment().format().split('T')[0];
      const obj = changes.find((o) => o.date === today);
      obj.range_supervisor = 'en route';
      changes.map((o) => (o.date === today ? obj : o));
    }
    if (!checked && changes[0].range_supervisor === 'en route') {
      changes[0].range_supervisor = 'confirmed';
    }

    if (changes.length > 0) {
      setWait(true);
      await putSchedules(changes);
    }

    setOpen(false);
    window.location.reload();
  }

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="otsikko"
      >
        <DialogTitle id="otsikko" style={dialogStyle}>{sv.Header[fin]}</DialogTitle>
        <DialogContent style={dialogStyle}>
          <DialogContentText>
            {noSchedule ? sv.No[fin] : ''}
            {done ? '' : sv.Wait[fin]}
          </DialogContentText>
          {schedules.length !== 0
            ? (
              <Rows
                HandleChange={HandleChange}
                changes={changes}
                checked={checked}
                setDone={setDone}
                sv={sv}
              />
            )
            : ''}
        </DialogContent>
        <DialogActions style={dialogStyle}>
          {wait
            ? (
              <div className={classes.root}>
                <CircularProgress />
              </div>
            )
            : ''}
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
              onCancel();
            }}
            style={{ backgroundColor: '#ede9e1' }}
          >
            {sv.Cancel[fin]}
          </Button>
          {done && !noSchedule
            ? (
              <Button
                variant="contained"
                onClick={HandleClose}
                style={{ backgroundColor: '#5f77a1' }}
              >
                {sv.Save[fin]}
              </Button>
            )
            : ''}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export { checkSupervisorReservations, DialogWindow };
