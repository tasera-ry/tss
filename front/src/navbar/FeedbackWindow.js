import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import api from '../api/api';
import texts from '../texts/texts.json';

const { feedback } = texts;

const dialogStyle = {
  backgroundColor: '#f2f0eb',
};

const FeedbackWindow = ({ user, dialogOpen, setDialogOpen }) => {
  const fin = localStorage.getItem('language');
  const [textFeedback, setTextFeedback] = useState('');
  const handleSend = async () => {
    setDialogOpen(false);
    await api.sendFeedback({
      feedback: textFeedback,
      user,
    });
  };
  return (
    <div>
      <Dialog open={dialogOpen} aria-labelledby="title">
        <DialogTitle id="title" style={dialogStyle}>
          {feedback.Title[fin]}
        </DialogTitle>
        <DialogContent style={dialogStyle}>
          <DialogContentText>{feedback.Note[fin]}</DialogContentText>
          <TextField
            id="feedback-field"
            inputProps={{
              'data-testid': 'feedback-field',
            }}
            variant="outlined"
            multiline
            rows={3}
            style={{ width: '100%' }}
            onChange={(e) => setTextFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions style={dialogStyle}>
          <Button
            variant="contained"
            onClick={() => {
              setDialogOpen(false);
            }}
            style={{ backgroundColor: '#ede9e1' }}
          >
            {feedback.Cancel[fin]}
          </Button>

          <Button
            variant="contained"
            onClick={handleSend}
            style={{ backgroundColor: '#5f77a1' }}
          >
            {feedback.Send[fin]}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FeedbackWindow;
