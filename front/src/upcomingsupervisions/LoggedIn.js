import React, { createContext, useState, useEffect, useContext } from 'react';

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
import TextField from '@material-ui/core/TextField';

// Axios for call-handling to backend
import axios from 'axios';

// Moment for date handling
import moment from 'moment';
import 'moment/locale/en-ca';

// API for backend calls
import api from '../api/api';

// Translations
import data from '../texts/texts.json';

// Styles
const dialogStyle = {
  backgroundColor: '#f2f2f2',
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

// Context for arrival time. Instead of prop drilling the value,
// we can use this context to pass the value between the components.
// useState hook is used to update the value in DialogWindow component.
const ArrivalTimeContext = createContext({
  arrivalTime: '',
  setArrivalTime: () => {},
  rangeofficer: '',
  setRangeOfficer: () => {},
});
/*
  LoggedIn.js is the component for accepting and denying upcoming supervision turns
*/

// print drop down menus in rows
const DropDowns = (props) => {
  const fin = localStorage.getItem('language');
  const id = props.d;
  const obj = props.changes.find((o) => o.date === id);
  const { rangeofficerList } = props;

  let text = props.sv.Present[fin];
  let color = '#f2f2f2';
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
  const [officerButtonText, setOfficerButtonText] = useState(
    props.sv.OfficerSelect[fin],
  );
  const [buttonColor, setButtonColor] = useState(color);
  const [anchorEl, setAnchorEl] = useState(null);
  const [officerAnchorEl, setOfficerAnchorEl] = useState(null);
  const [disable, setDisable] = useState(buttonColor !== '#658f60');
  const [provideTime, setProvideTimeText] = useState('');
  const { arrivalTime, setArrivalTime, rangeofficer, setRangeOfficer } =
    useContext(ArrivalTimeContext);

  const buttonStyle = {
    width: 180,
    backgroundColor: `${buttonColor}`,
  };
  /* eslint-disable-next-line */
  const discardChanges = {
    color: '#b3b3b3',
  };

  const handleTimeChange = (event) => {
    // TODO: Better error handling, atm no error messages are shown
    const parsedTime = moment(event.target.value, 'HH:mm', true);

    if (parsedTime.isValid()) {
      setArrivalTime(parsedTime.format('HH:mm'));
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOfficerClick = (event) => {
    setOfficerAnchorEl(event.currentTarget);
  };

  const HandleClose = (event) => {
    // data to be sent is in info
    // empty info means date is not confirmed

    if (event.currentTarget.dataset.info === '') {
      setButtonText(props.sv.Present[fin]);
      setButtonColor('#f2f2f2');
      setDisable(true);
      obj.range_supervisor = 'not confirmed';
      setProvideTimeText('');
    }
    if (event.currentTarget.dataset.info === 'y') {
      setButtonText(props.sv.Confirmed[fin]);
      setButtonColor('#658f60');
      setDisable(false);
      obj.range_supervisor = 'confirmed';

      setProvideTimeText(props.sv.ProvideTime[fin]);
    }
    if (event.currentTarget.dataset.info === 'n') {
      setButtonText(props.sv.Absent[fin]);
      setButtonColor('#c97b7b');
      setDisable(true);
      obj.range_supervisor = 'absent';
      setProvideTimeText('');
    }
    props.changes.map((o) => (o.date === id ? obj : o));
    // console.log(props.changes.find(o => o.date===id));

    setAnchorEl(null);
  };

  const handleOfficerClose = (officer) => {
    if (officer === null) {
      setOfficerButtonText(props.sv.NoOfficer[fin]);
      setRangeOfficer(null);
      setOfficerAnchorEl(null);
    } else {
      console.log('selected officer:', officer);
      setOfficerButtonText(officer.name);
      setRangeOfficer(officer);
      setOfficerAnchorEl(null);
    }
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
      {/* Range officer selection menu */}
      <div>
        {buttonText === props.sv.Confirmed[fin] && (
          <div>
            <p>Select rangeofficer</p>
            <Button
              onClick={handleOfficerClick}
              variant="outlined"
              size="small"
            >
              {officerButtonText}
            </Button>
            <Menu
              open={Boolean(officerAnchorEl)}
              anchorEl={officerAnchorEl}
              onClose={handleOfficerClose}
              keepMounted
            >
              <MenuItem onClick={() => handleOfficerClose(null)} data-info="">
                {props.sv.NoOfficer[fin]}
              </MenuItem>
              {rangeofficerList.map((officer) => (
                <MenuItem
                  key={officer.id}
                  onClick={() => handleOfficerClose(officer)}
                  data-info={officer.name}
                >
                  {officer.name}
                </MenuItem>
              ))}
            </Menu>
          </div>
        )}
      </div>
      <div>
        <p>{provideTime}</p>
        {buttonText === props.sv.Confirmed[fin] && (
          <TextField
            id="time"
            type="time"
            value={arrivalTime}
            onChange={handleTimeChange}
          />
        )}
      </div>
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
const Rows = ({
  HandleChange,
  changes,
  checked,
  setDone,
  sv,
  rangeofficerList,
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
        rangeofficerList={rangeofficerList}
      />
    </div>
  ));
};

// TODO: change config after relocating jwt
// TODO: try to somehow check this alongside request
async function getId(username) {
  if (!username) return;

  const query = `api/user?name=${username}`;
  try {
    const response = await axios.get(query);

    const userID = response.data[0].id;

    return userID; // eslint-disable-line
  } catch (error) {
    return error;
  }
}

// obtain date info
/* eslint-disable-next-line */
async function getReservations(res, setNoSchedule) {
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

  const response = await axios
    .get(query)
    .then(
      (
        response, // eslint-disable-line
      ) =>
        // check and return boolean about whether there's any unconfirmed reservations
        response.data.some(
          (sprvsn) => sprvsn.range_supervisor === 'not confirmed',
        ),
    )
    .catch((error) => {
      if (error.response.status !== 404) {
        console.log(error);
      }
    });

  return response;
}

// obtain users schedule and range supervision states
async function getSchedule(
  setSchedules,
  setNoSchedule,
  setChecked,
  setDone,
  username,
) {
  const userID = await getId(username);
  let res = [];
  let temp = [];

  const query = `api/schedule?association_id=${userID}`;
  /* eslint-disable-next-line */
  const response = await axios
    .get(query)
    /* eslint-disable-next-line */
    .then((response) => {
      if (response) {
        temp = temp.concat(response.data);
      }
    })
    /* eslint-disable-next-line */
    .catch((error) => {
      // console.log(error);
    });

  for (let i = 0; i < temp.length; i += 1) {
    const v = await temp[i];

    const rsquery = `api/range-supervision/${v.id}`;
    await axios
      .get(rsquery)
      /* eslint-disable-next-line */
      .then((response) => {
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
      /* eslint-disable-next-line */
      .catch((error) => {
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
  const [arrivalTime, setArrivalTime] = useState('');
  const [rangeofficer, setRangeOfficer] = useState('');
  const [rangeofficerList, setRangeOfficerList] = useState('');
  const { sv } = data;

  if (onCancel === undefined) {
    onCancel = () => {}; // eslint-disable-line
  }

  // starting point
  useEffect(() => {
    
    const myFunc = async() => {
      getSchedule(
        setSchedules,
        setNoSchedule,
        setChecked,
        setDone,
        cookies.username,
      );

      const response = await api.getRangeOfficers(cookies.id);
      setRangeOfficerList(response);
    };
    myFunc();
  }, []); // eslint-disable-line

  return (
    <div>
      <ArrivalTimeContext.Provider
        value={{ arrivalTime, setArrivalTime, rangeofficer, setRangeOfficer }}
      >
        <Logic
          rangeofficerList={rangeofficerList}
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
      </ArrivalTimeContext.Provider>
    </div>
  );
};

// sends updated info to database
async function putSchedules(changes) {
  for (let i = 0; i < changes.length; i += 1) {
    const { id } = changes[i];
    const query = `api/range-supervision/${id}`;

    const request = {
      range_supervisor: changes[i].range_supervisor,
      rangeofficer_id: changes[i].rangeofficer_id,
      arriving_at: changes[i].arriving_at,
    };

    console.log(id, request);

    await axios.put(query, request);
  }
}

// creates dialog-window
const Logic = ({
  rangeofficerList,
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

  const { arrivalTime, rangeofficer } = useContext(ArrivalTimeContext);

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

    if (arrivalTime) {
      changes[0].arriving_at = arrivalTime;
    }

    if (rangeofficer) {
      changes[0].rangeofficer_id = rangeofficer.id;
    }

    // Send updates to backend
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
              rangeofficerList={rangeofficerList}
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
            style={{ backgroundColor: '#e5e5e5' }}
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
