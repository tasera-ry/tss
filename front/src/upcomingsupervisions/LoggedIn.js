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

// Moment for date handling
import moment from 'moment';
import 'moment/locale/en-ca';

import api from '../api/api';
import translations from '../texts/texts.json';

// Styles
const dialogStyle = {
  backgroundColor: '#f2f0eb',
};
/* eslint-disable-next-line */
const discardChanges = {
  color: 'gray',
};
const checkboxStyle = {
  color: '#f2c66d',
};
const styleA = {
  padding: 25,
  textAlign: 'center',
};
/* eslint-disable-next-line */
const useStyles = makeStyles((theme) => ({
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
  if (
    obj.range_supervisor === 'confirmed' ||
    obj.range_supervisor === 'en route'
  ) {
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
  /* eslint-disable-next-line */
  const discardChanges = {
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
        <MenuItem onClick={HandleClose} data-info="" style={discardChanges}>
          {props.sv.Present[fin]}
        </MenuItem>
        <MenuItem onClick={HandleClose} data-info="y">
          {props.sv.Confirmed[fin]}
        </MenuItem>
        <MenuItem onClick={HandleClose} data-info="n">
          {props.sv.Absent[fin]}
        </MenuItem>
      </Menu>
      &nbsp;
      {props.today === props.d ? (
        <Check
          HandleChange={props.HandleChange}
          checked={props.checked}
          sv={props.sv}
          disable={disable}
        />
      ) : (
        ''
      )}
    </span>
  );
};

// prints matkalla-checkbox
const Check = ({ HandleChange, checked, sv, disable }) => {
  const fin = localStorage.getItem('language');

  return (
    <>
      <br />
      <FormControlLabel
        label={sv.EnRoute[fin]}
        disabled={disable}
        control={
          <Checkbox
            checked={checked}
            style={checkboxStyle}
            onChange={HandleChange}
          />
        }
      />
    </>
  );
};

// prints date info in rows
const Rows = ({ HandleChange, changes, checked, setDone, sv }) => {
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

  return changes.map((d) => (
    <div key={d.date} style={styleA}>
      {getWeekday(d.date)} {getDateString(d.date)} &nbsp;
      <DropDowns
        d={d.date}
        today={today}
        changes={changes}
        HandleChange={HandleChange}
        checked={checked}
        sv={sv}
      />
    </div>
  ));
};

// TODO: change config after relocating jwt
// TODO: try to somehow check this alongside request
// can throw an error if request fails
async function getId(username) {
  if (!username) return;

  const data = await api.getUser(username);
  const userID = data[0].id;

  return userID;
}

// obtain date info
/* eslint-disable-next-line */
// can throw an error if request fails
async function getReservations(res, setNoSchedule) {
  // eslint-disable-line
  const today = moment().format().split('T')[0];

  for (let i = 0; i < res.length; i += 1) {
    const response = await api.getAvailableReservation(res[i].reservation_id);
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
  try {
    const userID = await getId(username);

    const data = await api.getSupervisorReservations(userID);
    // check and return boolean about whether there's any unconfirmed reservations
    return data.some((sprvsn) => sprvsn.range_supervisor === 'not confirmed');
  } catch (err) {
    console.log(err);
    return false;
  }
}

// obtain users schedule and range supervision states
async function getSchedule(
  setSchedules,
  setNoSchedule,
  setChecked,
  setDone,
  username,
) {
  try {
    const userID = await getId(username);
    const res = [];
    const schedules = [];

    const data = await api.getSupervisorSchedules(userID);
    schedules.push(data);

    /* eslint-disable-next-line */
    schedules.forEach(async ({ id, range_reservation_id }) => {
      const data = await api.getRangeSupervision(id);

      res.push({
        userID,
        date: '',
        id,
        reservation_id: range_reservation_id,
        range_supervisor: data[0].range_supervisor,
      });
    });
    const reservations = await getReservations(res, setNoSchedule);

    if (reservations.length === 0) {
      await setNoSchedule(true);
      await setDone(true);
      return;
    }

    setSchedules(reservations);
    setChecked(reservations[0].range_supervisor === 'en route');
  } catch (err) {
    console.log(err);
  }
}

const DialogWindow = ({ onCancel }) => {
  const [noSchedule, setNoSchedule] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const [cookies] = useCookies(['username']);
  const { sv } = translations;

  if (onCancel === undefined) {
    onCancel = () => {}; // eslint-disable-line
  }

  // starting point
  useEffect(() => {
    getSchedule(
      setSchedules,
      setNoSchedule,
      setChecked,
      setDone,
      cookies.username,
    );
  }, [cookies.username]);

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
const putSchedules = async (changes) => {
  /* eslint-disable-next-line */
  const promises = changes.map(({ id, range_supervisor }) =>
    api.patchRangeSupervision(id, range_supervisor),
  );

  await Promise.all(promises);
};

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

  /* eslint-disable-next-line */
  const HandleChange = (event) => {
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
      <Dialog open={open} aria-labelledby="otsikko">
        <DialogTitle id="otsikko" style={dialogStyle}>
          {sv.Header[fin]}
        </DialogTitle>
        <DialogContent style={dialogStyle}>
          <DialogContentText>
            {noSchedule ? sv.No[fin] : ''}
            {done ? '' : sv.Wait[fin]}
          </DialogContentText>
          {schedules.length !== 0 ? (
            <Rows
              HandleChange={HandleChange}
              changes={changes}
              checked={checked}
              setDone={setDone}
              sv={sv}
            />
          ) : (
            ''
          )}
        </DialogContent>
        <DialogActions style={dialogStyle}>
          {wait ? (
            <div className={classes.root}>
              <CircularProgress />
            </div>
          ) : (
            ''
          )}
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
          {done && !noSchedule ? (
            <Button
              variant="contained"
              onClick={HandleClose}
              style={{ backgroundColor: '#5f77a1' }}
            >
              {sv.Save[fin]}
            </Button>
          ) : (
            ''
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export { checkSupervisorReservations, DialogWindow };
