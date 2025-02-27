import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Close from '@mui/icons-material/Close';
import Alert from '@mui/lab/Alert';
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
    <div className={classes(css.infoContainer)} data-testid="infoboxContainer">
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
const InfoBox = ({ tabletMode = false }) => {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    const getPublicMessages = async () => {
      const res = await api.getPublicInfoMessages();
      if (res) setInfo(res);
    };
    const getRangeMasterInfoMessages = async () => {
      const res = await api.getRangeMasterInfoMessages();
      if (!res) {
        // User is not logged in, fetch public messages
        getPublicMessages();
      } else {
        setInfo(res);
      }
    };

    if (tabletMode) {
      getRangeMasterInfoMessages();
    } else {
      getPublicMessages();
    }
  }, []);

  if (!info) return null;

  return info.map((infos) => <InfoComp key={infos.id} message={infos}/>);
};

export default InfoBox;
