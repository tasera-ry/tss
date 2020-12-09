import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// import {  } from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
// import Typography from '@material-ui/core/Typography';
import axios from 'axios';

export function TrackStatistics(props) {
  const [tracks, setTracks] = useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleStats = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    setTracks(props.tracks);
  }, [props.tracks]);

  const opts = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // function substract() {
  //   setUserCount(userCount - 1);
  //   if (userCount < 0) {
  //     setUserCount(0);
  //   }
  // }
  const handleChange = (event) => {
    const { target } = event;
    setTracks(tracks.map((track) => {
      if (track.id === parseInt(target.id)) {
        console.log({ ...track, scheduled: {
          ...track.scheduled,
          visitors: target.value,
        } });
        return { ...track, scheduled: {
          ...track.scheduled,
          visitors: parseInt(target.value),
        } };
      }
      return track;
    }));
  };

  const sendStats = () => {
    tracks.forEach(async (track) => {
      if (track.scheduled) {
        console.log(track.scheduled.scheduled_range_supervision_id);
        console.log(track);
        await axios.put(
          `/api/track-supervision/${track.scheduled.scheduled_range_supervision_id}/${track.id}`,
          track,
          opts,
        );
      }
    });
    handleClose();
  };

  const Tracklines = () => {
    console.log(tracks);
    const trackRows = tracks.map((track) => (
    // setUserCount(track.scheduled.visitors);
      <div key={track.id}>
        {/* <Button id="miinus" variant="primary" onClick={() => substract()}>-</Button> */}
        <TextField
          id={track.id.toString()}
          className="visitorAmount"
          label={track.name}
          defaultValue={track?.scheduled?.visitors}
          onChange={handleChange}
        />
        {/* <Button id="plussa" variant="primary" onClick={() => setUserCount(userCount + 1)}>+</Button> */}
      </div>
    ));
    return trackRows;
  };

  return (
    <div>
      <Button id="visitorBoxButton" color="primary" variant="contained" onClick={handleStats}>Lisää radan käyttäjien tiedot</Button>
      <Dialog id="visitorBox" open={dialogOpen} onClose={handleClose}>
        <DialogTitle id="dialogiOtsikko">Lisää kävijöiden määrä</DialogTitle>
        <DialogContent>
          { tracks
            ? <Tracklines />
            : <div>empty</div> }
        </DialogContent>
        <DialogActions>
          <Button id="closeButton" onClick={handleClose} variant="contained" color="secondary">Takaisin</Button>
          <Button id="sendButton" onClick={sendStats} variant="contained" color="primary">Lähetä tiedot</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// <Typography>{track.name}</Typography>

// setUserCount(userCount - 1)

// const [userCount, setUserCount] = useState(0);
// <Button id="miinus" variant="primary" onClick={() => substract()}>-</Button>
// <TextField variant="outlined" value={userCount} />
// <Button id="plussa" variant="primary" onClick={() => setUserCount(userCount + 1)}>+</Button>
//
// function substract() {
//    setUserCount(userCount - 1);
//    if (userCount < 0) {
//      setUserCount(0);
//    }
//  }

export default TrackStatistics;
