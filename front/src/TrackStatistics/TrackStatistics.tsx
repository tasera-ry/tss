import { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import Button from '@mui/material/Button';
// enables overriding material-ui component styles in scss
import { StyledEngineProvider, Theme } from '@mui/material/styles';
import css from './TrackStatistics.module.scss';
import { makeStyles } from '@mui/styles';
import Modal from '@mui/material/Modal';
import { useLingui } from '@lingui/react/macro';
import clsx from 'clsx';

const classes = classNames.bind(css);

export const TrackStatistics = ({ track, supervision, disabled }) => {
  const { t } = useLingui();

  const isDisabled = Boolean(track.trackSupervision === 'absent' || disabled);
  const { scheduled, id } = track;
  const scheduled_range_supervision_id = scheduled
    ? scheduled.scheduled_range_supervision_id
    : null;
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

  const useStyles = makeStyles((theme: Theme) => ({
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
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <StyledEngineProvider injectFirst>
      <div className={classes(css.trackContainer)}>
        <Button
          name="decrease-visitors"
          disabled={isDisabled}
          variant="contained"
          className={classes(css.button)}
          onClick={() => {
            handleOpen();
          }}
          style={{ backgroundColor: 'red' }}
        >
          -
        </Button>
        <div className={classes(css.visitorAmount)} id="amount-of-visitors">
          {visitors}
        </div>
        <Button
          name="increase-visitors"
          disabled={isDisabled}
          variant="contained"
          className={classes(css.button)}
          onClick={() => changeVisitors(visitors + 1)}
          style={{ backgroundColor: 'green' }}
        >
          +
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div
            className={clsx(
              classesStyles.paper,
              'top-1/2 left-1/2 transform translate-x-1/2 translate-y-1/2',
            )}
          >
            <h2 id="simple-modal-title">{t`Warning!`}</h2>
            <p id="simple-modal-description">
              {t`Users should not be reduced, Do you really want to reduce the number of users?`}
            </p>
            <div className={classes(css.trackContainer)}>
              <Button
                variant="contained"
                style={{ color: 'white' }}
                onClick={() => {
                  changeVisitors(visitors - 1);
                  handleClose();
                }}
              >
                {t`Yes`}
              </Button>
              <Button
                variant="contained"
                style={{ color: 'white' }}
                onClick={() => handleClose()}
              >
                {t`No`}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </StyledEngineProvider>
  );
};
