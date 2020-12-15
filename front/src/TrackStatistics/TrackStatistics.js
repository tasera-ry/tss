import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './TrackStatistics.css';

// Material-UI components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

// Import localization
import { trackStatistics as texts } from '../texts/texts.json';

export function TrackStatistics(props) {
  const [tracks, setTracks] = useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleStats = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);
  const lang = localStorage.getItem('language');

  useEffect(() => {
    setTracks(props.tracks);
  }, [props.tracks]);

  // Function for raising or lowering number of visitors in a given track via buttons.
  // Also checks that the number of visitors will never be less than 0.
  // Operator is "inc" or "dec"
  const increment = (trackId, operator) => {
    setTracks(tracks.map((track) => {
      if (track.id === parseInt(trackId)) {
        let newVisitors = track.scheduled.visitors + 1;
        if (operator === 'dec') {
          newVisitors = track.scheduled.visitors - 1;
        }
        if (operator !== 'dec' || track.scheduled.visitors !== 0) {
          return {
            ...track,
            scheduled: {
              ...track.scheduled,
              visitors: newVisitors,
            },
          };
        }
      }
      return track;
    }));
  };

  const handleChange = (event) => {
    const { target } = event;
    setTracks(tracks.map((track) => {
      if (track.id === parseInt(target.id)) {
        return {
          ...track,
          scheduled: {
            ...track.scheduled,
            visitors: parseInt(target.value),
          },
        };
      }
      return track;
    }));
  };

  // Sends the changed visitors statistics to backend
  const sendStats = () => {
    tracks.forEach(async (track) => {
      if (track.scheduled) {
        const trackOpts = {
          scheduled_range_supervision_id: track.scheduled.scheduled_range_supervision_id,
          track_id: track.id,
          notice: track.scheduled.notice,
          track_supervisor: track.scheduled.track_supervisor,
          visitors: track.scheduled.visitors,
        };
        await axios.put(
          `/api/track-supervision/${track.scheduled.scheduled_range_supervision_id}/${track.id}`,
          trackOpts,
        );
      }
    });
    handleClose();
  };

  return (
    <div>
      <Button id="visitorBoxButton" color="primary" variant="contained" onClick={handleStats}>{texts.addVisitorsButton[lang]}</Button>
      <Dialog id="visitorBox" maxWidth="xl" open={dialogOpen} onClose={handleClose}>
        <DialogTitle>
          <div className="dialogTitle">
            {texts.addVisitorsTitle[lang]}
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="trackContainer">
            {tracks.map((track) => (
              <div className="trackRow" key={track.id}>
                <div className="trackName">
                  {track.name}
                </div>
                <Button variant="contained" onClick={() => increment(track.id, 'dec')}>
                  <div className="buttonText">
                    -
                  </div>
                </Button>
                <TextField
                  InputProps={{
                    min: 0,
                    style: { fontSize: 30 },
                  }}
                  id={track.id.toString()}
                  className="visitorAmount"
                  type="number"
                  value={track?.scheduled?.visitors}
                  onChange={handleChange}
                />
                <Button variant="contained" onClick={() => increment(track.id, 'inc')}>
                  <div className="buttonText">
                    +
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            <div className="buttonText">
              {texts.backButton[lang]}
            </div>
          </Button>
          <Button onClick={sendStats} variant="contained" color="primary">
            <div className="buttonText">
              {texts.sendButton[lang]}
            </div>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TrackStatistics;
