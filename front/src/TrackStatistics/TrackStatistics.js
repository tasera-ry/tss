import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// import {  } from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

export function TrackStatistics(props) {
  const Tracklines = (tracks) => {
    console.log(tracks);
    const trackRows = tracks.tracks.map((track) => (
      <div key={track.id}>
        <TextField id="visitorAmount" label={track.name} />
      </div>
    ));
    return trackRows;
  };
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleStats = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);
  // const [tracks, setTracks] = useState([]);
  return (
    <div>
      <Button id="visitorBoxButton" color="primary" variant="contained" onClick={handleStats}>Lisää radan käyttäjien tiedot</Button>
      <Dialog id="visitorBox" open={dialogOpen} onClose={handleClose}>
        <DialogTitle id="dialogiOtsikko">Lisää kävijöiden määrä</DialogTitle>
        <DialogContent>
          <Tracklines
            tracks={props.tracks}
          />
        </DialogContent>
        <DialogActions>
          <Button id="closeButton" onClick={handleClose} variant="contained" color="secondary">Takaisin</Button>
          <Button id="sendButton" onClick={handleClose} variant="contained" color="primary">Lähetä tiedot</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

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
