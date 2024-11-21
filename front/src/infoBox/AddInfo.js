import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import classNames from 'classnames';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';

import {
  Button,
  TextField,
  FormControlLabel, 
  Checkbox,
  Select,
  MenuItem,
} from '@mui/material';

import { validateLogin } from '../utils/Utils';
import translations from '../texts/texts.json';
import api from '../api/api';
import css from './AddInfo.module.scss';

const classes = classNames.bind(css);

const { infoPage } = translations;


/* 
    IMPORTANT: Current implementation is MVP, needs to be fixed to fulfil actual customer needs
*/

const InfoText = ({ message, onDelete }) => {
  const deleteMessage = async () => {
    await api.deleteInfoMessage(message);
    onDelete();
  };

  return (
    <div className={classes(css.messageContainer)}>
      • {message.message} (<i>{message.start.slice(0, 10)} → {message.end.slice(0, 10)} to: {message.recipients}</i>)
      <DeleteOutlined className={classes(css.deleteIcon)} onClick={deleteMessage} />
    </div>
  );
};

const AddInfo = () => {
  const lang = localStorage.getItem('language');

  const [infoText, setInfoTexts] = useState([]);
  const [numOfInfoMessages, setNumOfInfoMessages] = useState(0);
  const [userOption, setUserOptions] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [cookies] = useCookies(['username']);
  const [infoRequest, setInfoRequest] = useState({
    message: '',
    start: new Date(), //Defaults to today
    end: new Date(new Date().getTime() + 86400000), //Defaults to tomorrow
    recipients: 'all',
    sender: cookies.username,
    show_weekly: false,
    show_monthly: false,
  });

  const getMessage = async () => {
    const logInSuccess = await validateLogin();
    if (!logInSuccess) window.location.href = '/';

    try {
      const res = await api.getAllInfoMessages();
      if (res) setInfoTexts(res);
    } finally {
      setisLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      const res = await api.getUsers();
      if (res) {
        res.sort((a, b) => {
          if(a.name < b.name) return -1;
          if(a.name > b.name) return 1;
          return 0;
        });
        setUserOptions(res);
      }
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    getMessage();
  }, [numOfInfoMessages]);

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await api.postInfoMessage(infoRequest);
      setNumOfInfoMessages(numOfInfoMessages + 1);
    } catch (err) {
      console.log(err);
    }

    setInfoRequest({
      message: '',
      start: new Date(), //Defaults to today
      end: new Date(new Date().getTime() + 86400000), //Defaults to tomorrow
      recipients: 'all',
      sender: cookies.username,
      show_weekly: false,
      show_monthly: false,
    });

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
          onChange={(e) => setInfoRequest({ ...infoRequest, message: e.target.value })}
          value={infoRequest.message}
          variant="standard"
          style={{ marginBottom: '10px', width: '300px' }}
        />
      </div>
      <div>
        <TextField
          type="date" required
          label={infoPage.startDate[lang]}
          defaultValue={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setInfoRequest({ ...infoRequest, start: e.target.value })}
          inputProps={{ min: new Date().toISOString().slice(0, 10) }}
        />
      </div>
      <div>
        <TextField
          type="date" required
          label={infoPage.endDate[lang]}
          defaultValue={new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10)}
          onChange={(e) => setInfoRequest({ ...infoRequest, end: e.target.value })}
          inputProps={{ min: new Date(new Date(infoRequest.start).getTime() + 86400000).toISOString().slice(0, 10) }}
        />
      </div>


    {/* TO-DO: Implement functionality */}

      {/* <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={infoRequest.show_weekly}
              onChange={(e) => setInfoRequest({ ...infoRequest, show_weekly: e.target.value })}       
              color="default"
              disabled
            />
          }
          label={infoPage.repeatWeekly[lang]}
        />
      </div> */}
      {/* <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={infoRequest.show_monthly}
              onChange={(e) => setInfoRequest({ ...infoRequest, show_monthly: e.target.value })}
              color="default"
              disabled
            />
          }
          label={infoPage.repeatMonthly[lang]}
        />
      </div> */}


      <div>
        <Select
          value={infoRequest.recipients}
          onChange={(e) => setInfoRequest({ ...infoRequest, recipients: e.target.value.toString() })}
          MenuProps={{ style: { maxHeight: 400 } }}

        >
          <MenuItem value={'all'}>{infoPage.sendPublicMessage[lang]}</MenuItem>
          <MenuItem value={'rangemaster'}>{infoPage.sendRangeMasterMessage[lang]}</MenuItem>
          {userOption.map((user) => <MenuItem
            key={user.id}
            value={user.name}
          >
            {user.name}
          </MenuItem>)}
        </Select>
      </div>
      <div>
        <Button
          type="button"
          className={classes(css.sandButton)} 
          variant="contained"
          onClick={handleClick}
          disabled={
            infoRequest.message === '' || new Date(infoRequest.end).setHours(0, 0, 0, 0) <= new Date(infoRequest.start).setHours(0, 0, 0, 0)
          }>
          {infoPage.send[lang]}
        </Button>
      </div>
      <hr />
      {infoText && <> {infoText.map((infos) => <InfoText key={infos.id} message={infos} onDelete={() => setNumOfInfoMessages(numOfInfoMessages - 1)} />)} </>}
    </div>
  );
};

export default AddInfo;
