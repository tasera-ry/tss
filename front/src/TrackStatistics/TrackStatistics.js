import React, { useState } from 'react';
import axios from 'axios';

import './TrackStatistics.css';

// Material-UI components
import Button from '@material-ui/core/Button';

const ButtonStyle = {
  marginTop: 4,
  width: 50,
  height: 50,
  borderRadius: 50,
}

export function TrackStatistics({ track }) {
  const [visitors, setVisitors] = useState(track.scheduled.visitors);

  // Function for raising or lowering number of visitors in a given track via buttons.
  // Also checks that the number of visitors will never be less than 0.
  // Operator is "inc" or "dec"
  const increment = (operator, sendVisitors) => {
    let newVisitors = visitors + 1;
    if (operator === 'dec') {
      newVisitors = visitors - 1;
    }
    if (operator !== 'dec' || visitors !== 0) {
      setVisitors(newVisitors);
      sendVisitors(newVisitors);
    }
  };

  // Sends the changed visitors statistics to backend
  const sendStats = async (newVisitors) => {
    if (track.scheduled) {
      const trackOpts = {
        scheduled_range_supervision_id: track.scheduled.scheduled_range_supervision_id,
        track_id: track.id,
        notice: track.scheduled.notice,
        track_supervisor: track.scheduled.track_supervisor,
        visitors: newVisitors,
      };
      await axios.put(
        `/api/track-supervision/${track.scheduled.scheduled_range_supervision_id}/${track.id}`,
        trackOpts,
      );
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
      <div className="visitorAmount">
        {visitors}
      </div>
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
