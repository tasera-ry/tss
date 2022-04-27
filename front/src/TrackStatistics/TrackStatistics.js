import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import Button from '@material-ui/core/Button';
// enables overriding material-ui component styles in scss
import { StylesProvider } from '@material-ui/core/styles';
import css from './TrackStatistics.module.scss';

const classes = classNames.bind(css);

export const TrackStatistics = ({ track, supervision }) => {
  const isDisabled = Boolean(track.trackSupervision === 'absent')
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

  return (
    <StylesProvider injectFirst>
      <div className={classes(css.trackContainer)}>
        <Button
          disabled={isDisabled}
          variant="contained"
          className={classes(css.button)}
          onClick={() => changeVisitors(visitors - 1)}
        >
          -
        </Button>
        <div className={classes(css.visitorAmount)}>{visitors}</div>
        <Button
          disabled={isDisabled}
          variant="contained"
          className={classes(css.button)}
          onClick={() => changeVisitors(visitors + 1)}
        >
          +
        </Button>
      </div>
    </StylesProvider>
  );
};
