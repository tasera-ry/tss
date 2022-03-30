import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import Button from '@material-ui/core/Button';
// enables overriding material-ui component styles in scss
import { StylesProvider } from '@material-ui/core/styles';
import css from './TrackStatistics.module.scss';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

const classes = classNames.bind(css);

export const TrackStatistics = ({ track, supervision }) => {
  const { scheduled, id } = track;
  const { scheduled_range_supervision_id } = scheduled;

  const [visitors, setVisitors] = useState(
    scheduled && scheduled.visitors ? scheduled.visitors : 0,
  );

  // Raises or lowers the number of visitors in a given track
  const changeVisitors = async (newVisitors) => {
    if (!scheduled || newVisitors === 0) return;
    // TODO FIX: always updates the visitors state regardless of patch success
    setVisitors(newVisitors);
    await sendStats(newVisitors);
  };

  // Sends the changed visitors statistics to backend
  const sendStats = async (newVisitors) => {
    if (!scheduled) return;
    try {
      await api.patchScheduledSupervisionTrack(
        scheduled_range_supervision_id,
        id,
        {
          scheduled_range_supervision_id,
          track_supervisor: supervision,
          visitors: newVisitors,
        },
      );
    } catch (err) {
      console.log(err);
    }
  };
  
  const displayWarningAlert = () => {
    const lang = localStorage.getItem('language');
    let message = "";
    let messageTitle = "";
    let messageYes = "";
    let messageNo = "";
    if(lang === "0"){
      message = "Käyttäjiä ei tule vähentää. Haluatko todella vähentää käyttäjien määrää?";
      messageTitle = "Varoitus!"
      messageYes = "Joo";
      messageNo = "Ei";
    } else if(lang === "1"){
      message = "Users should not be reduced, Do you really want to reduce the number of users?";
      messageTitle = "Warning!";
      messageYes = "Yes";
      messageNo = "No";
    } else if(lang === "2"){
      message = "Användare ska inte minskas. Vill du verkligen minska antalet användare?"; 
      messageTitle = "Varning!";
      messageYes = "Ja";
      messageNo = "Nej";
    }
    setMessage(message);
    setMessageTitle(messageTitle);
    setMessageYes(messageYes);
    setMessageNo(messageNo);
    handleOpen();
  }

  function rand() {
    return Math.round(Math.random() * 20) - 10;
  }
  
  function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));

  const classesStyles = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Käyttäjiä ei tule vähentää. Haluatko todella vähentää käyttäjien määrää?");
  const [messageTitle, setMessageTitle] = useState("Varoitus");
  const [messageYes, setMessageYes] = useState("Joo");
  const [messageNo, setMessageNo] = useState("Ei");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classesStyles.paper}>
      <h2 id="simple-modal-title">{messageTitle}</h2>
      <p id="simple-modal-description">
        {message}
      </p>
      <div className={classes(css.trackContainer)}>
      <Button
        variant="contained"
        style={{ color: 'red' }}
        onClick={() => {changeVisitors(visitors - 1); handleClose();}}
        >
          {messageYes}
      </Button>
      <Button
        variant="contained"
        style={{ color: 'green' }}
        onClick={() => handleClose()}>
          {messageNo}
      </Button>
      </div>
    </div>
  );

  return (
    <StylesProvider injectFirst>
      <div className={classes(css.trackContainer)}>
        <Button
          variant="contained"
          className={classes(css.button)}
          onClick={() => displayWarningAlert()}
        >
          -
        </Button>
        <div className={classes(css.visitorAmount)}>{visitors}</div>
        <Button
          variant="contained"
          className={classes(css.button)}
          onClick={() => changeVisitors(visitors + 1)}
        >
          +
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {body}
      </Modal>
      </div>
    </StylesProvider>
  );
};
