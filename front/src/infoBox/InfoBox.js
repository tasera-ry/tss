import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Close from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import api from '../api/api';
import css from './InfoBox.module.scss';

const classes = classNames.bind(css);

// IMPORTANT: Current implementation is MVP, needs to be fixed to fulfil actual customer needs

const InfoComp = ({ message }) => {
  // TO DO: Fix -> Visibility resets every time you reload / change page
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  // Compare start date of the message to the today's day and don't show it if start > today
  if (message.start > new Date().toISOString()) return null;

  return (
    <div className={classes(css.infoContainer)}>
      <div className={classes(css.infoBox)}>
        <Close
          fontSize="small"
          className={classes(css.closeIcon)}
          onClick={() => setVisible(false)}
        />
        {/* TO DO: severity based on the type of info-message */}
        <Alert severity="warning">
          {message.message}
        </Alert>
      </div>
    </div>
  );
};

// TO DO: Take weekly and monthly values into account
const InfoBox = () => {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    const getMessage = async () => {
      const res = await api.getInfoMessage();
      if (res) setInfo(res);
    };
    getMessage();
  }, []);

  return (
    <>
      {info && <> {info.map((infos) => <InfoComp message={infos} />)} </> }
    </>
  );
};

export default InfoBox;
