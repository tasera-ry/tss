import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import Button from '@mui/material/Button';
// enables overriding material-ui component styles in scss
import { StyledEngineProvider } from '@mui/material/styles';
import css from './TrackStatistics.module.scss';
import { makeStyles } from '@mui/styles';
import Modal from '@mui/material/Modal';
import translations from '../texts/texts.json';
const { trackStatisticsModal } = translations;


const classes = classNames.bind(css);

export const TrackStatistics = ({ track, supervision }) => {
  const isDisabled = Boolean(track.trackSupervision === 'absent')
  const { scheduled, id } = track;
  const { scheduled_range_supervision_id } = scheduled;
  const lang = localStorage.getItem('language');
  const [visitors, setVisitors] = useState(
    scheduled && scheduled.visitors ? scheduled.visitors : 0,
  );

  // Raises or lowers the number of visitors in a given track
  const changeVisitors = async (newVisitors) => {
    if (!scheduled || newVisitors === -1) return;
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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classesStyles.paper}>
      <h2 id="simple-modal-title">{trackStatisticsModal.messageTitle[lang]}</h2>
      <p id="simple-modal-description">
        {trackStatisticsModal.message[lang]}
      </p>
      <div className={classes(css.trackContainer)}>
      <Button
        variant="contained"
        style={{ color: 'red' }}
        onClick={() => {changeVisitors(visitors - 1); handleClose();}}
        >
        {trackStatisticsModal.messageYes[lang]}
      </Button>
      <Button
        variant="contained"
        style={{ color: 'green' }}
        onClick={() => handleClose()}>
        {trackStatisticsModal.messageNo[lang]}
      </Button>
      </div>
    </div>
  );

  return (
    <StyledEngineProvider injectFirst>
      <div className={classes(css.trackContainer)}>
        <Button
          disabled={isDisabled}
          variant="contained"
          className={classes(css.button)}
          onClick={() => {handleOpen(); changeVisitors(visitors - 1)}}
          style= {{backgroundColor: '#d1ccc2'}}
        >
          -
        </Button>
        <div className={classes(css.visitorAmount)}>{visitors}</div>
        <Button
          disabled={isDisabled}
          variant="contained"
          className={classes(css.button)}
          onClick={() => changeVisitors(visitors + 1)}
          style= {{backgroundColor: '#d1ccc2'}}
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
    </StyledEngineProvider>
  );
};
