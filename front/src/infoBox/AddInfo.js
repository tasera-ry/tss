import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import DeleteOutlined from '@material-ui/icons/DeleteOutlined';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { dateToString, validateLogin } from '../utils/Utils';
import translations from '../texts/texts.json';
import api from '../api/api';
import css from './AddInfo.module.scss';

const classes = classNames.bind(css);

const { infoPage } = translations;

/*  IMPORTANT: ONLY SUPER USER SHOULD BE ALLOWED ON THIS PAGE
      - Add user type checks before allowing access
    IMPORTANT: Current implementation is MVP, needs to be fixed to fulfil actual customer needs
*/

const InfoText = ({ message, onDelete }) => {
  const deleteMessage = async () => {
    await api.deleteInfoMessage(message);
    onDelete();
  };

  return (
    <div className={classes(css.messageContainer)}>
      • {message.message} (<i>{message.start.slice(0, 10)} → {message.end.slice(0, 10)}</i>)
      <DeleteOutlined className={classes(css.deleteIcon)} onClick={deleteMessage} />
    </div>
  );
};

// TO DO: Fix calendars.
const AddInfo = () => {
  const lang = localStorage.getItem('language');

  const [info, setInfo] = useState([]);
  const [infoLength, setInfoLength] = useState(0);
  const [message, setMessage] = useState('');
  const [start, setStart] = useState(new Date()); // Defaults to today
  const [end, setEnd] = useState(new Date(new Date().getTime() + 86400000)); // Defaults to tomorrow
  const [weekly, setWeekly] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  const getMessage = async () => {
    const logInSuccess = await validateLogin();
    if (!logInSuccess) window.location.href = '/';

    try {
      const res = await api.getInfoMessage();
      if (res) setInfo(res);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    getMessage();
  }, [infoLength]);

  const handleClick = async (e) => {
    e.preventDefault();

    const infoRequest = {
      message,
      start,
      end,
      show_weekly: weekly,
      show_monthly: monthly,
    };

    try {
      await api.postInfoMessage(infoRequest);
      setInfoLength(infoLength + 1);
    } catch (err) {
      console.log(err);
    }

    setMessage('');
    setStart(new Date());
    setEnd(new Date(new Date().getTime() + 86400000));
    setWeekly(false);
    setMonthly(false);

  };

  if (isLoading) return null;

  return (
    <div className={classes(css.infoContainer)}>
      <h1>{infoPage.title[lang]}</h1>
      <div>
        <TextField
          id="outlined-multiline-static"
          label={infoPage.message[lang]}
          multiline
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          variant="standard"
          style={{ marginBottom: '10px', width: '300px' }}
        />
      </div>
      <div>
        <TextField
          type="date" required
          label={infoPage.startDate[lang]}
          defaultValue={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setStart(e.target.value)}
          inputProps={{ min: new Date().toISOString().slice(0, 10) }}
        />
      </div>
      <div>
        <TextField
          type="date" required
          label={infoPage.endDate[lang]}
          defaultValue={new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10)}
          onChange={(e) => setEnd(e.target.value)}
          inputProps={{ min: new Date(new Date(start).getTime() + 86400000).toISOString().slice(0,10) }}
        />
      </div>
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={weekly}
              onChange={() => setWeekly(!weekly)}
              color="default"
            />
          }
          label={infoPage.repeatWeekly[lang]}
        />
      </div>
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={monthly}
              onChange={() => setMonthly(!monthly)}
              color="default"
            />
          }
          label={infoPage.repeatMonthly[lang]}
        />
      </div>
      <div>
        <Button 
        type="button" 
        variant="contained" 
        onClick={handleClick} 
        disabled={
          message === '' || new Date(end).setHours(0,0,0,0) <= new Date(start).setHours(0,0,0,0)
          }>
            {infoPage.send[lang]}
            </Button>
      </div>
      <hr />
      {info && <> {info.map((infos) => <InfoText message={infos} onDelete={()=>setInfoLength(infoLength - 1)} />)} </>}
    </div>
  );
};

export default AddInfo;
