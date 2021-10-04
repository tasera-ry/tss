import React, { useState } from 'react';

// Material-UI components
import Button from '@material-ui/core/Button';

import api from '../api/api';
import './TrackStatistics.css';

const ButtonStyle = {
  marginTop: 4,
  width: 50,
  height: 50,
  borderRadius: 50,
};

export function TrackStatistics({ track, supervision }) {
  const [visitors, setVisitors] = useState(
    track.scheduled && track.scheduled.visitors ? track.scheduled.visitors : 0,
  );

  // Function for raising or lowering number of visitors in a given track via buttons.
  // Also checks that the number of visitors will never be less than 0.
  // Operator is "inc" or "dec"
  const increment = (operator, sendVisitors) => {
    let newVisitors = visitors + 1;
    if (operator === 'dec') {
      newVisitors = visitors - 1;
    }
    if ((operator !== 'dec' || visitors !== 0) && track.scheduled) {
      setVisitors(newVisitors);
      sendVisitors(newVisitors);
    }
  };

  // Sends the changed visitors statistics to backend
  const sendStats = async (newVisitors) => {
    if (!track.scheduled) return;
    try {
      const trackOpts = {
        scheduled_range_supervision_id:
          track.scheduled.scheduled_range_supervision_id,
        track_id: track.id,
        notice: track.scheduled.notice,
        track_supervisor: supervision,
        visitors: newVisitors,
      };
      await api.patchScheduledSupervisionTrack(
        track.scheduled.scheduled_range_supervision_id,
        track.id,
        trackOpts,
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="trackContainer">
      <Button
        variant="contained"
        style={ButtonStyle}
        onClick={() => increment('dec', sendStats)}
      >
        <div className="buttonText">-</div>
      </Button>
      <div className="visitorAmount">{visitors}</div>
      <Button
        variant="contained"
        style={ButtonStyle}
        onClick={() => increment('inc', sendStats)}
      >
        <div className="buttonText">+</div>
      </Button>
    </div>
  );
}

export default TrackStatistics;
