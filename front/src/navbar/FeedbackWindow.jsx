import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import translations from '../texts/texts.json';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import css from './FeedbackWindow.module.scss';

const classes = classNames.bind(css);
const { feedback } = translations;

const FeedbackWindow = ({ user, dialogOpen, onCloseDialog }) => {
  const fin = localStorage.getItem('language');
  const [textFeedback, setTextFeedback] = useState('');

  return (
    <Dialog
      aria-labelledby="title"
      className={classes(css.dialog)}
      open={dialogOpen}
      classes={{ paper: classes(css.paper) }}
    >
      <DialogTitle id="title">{feedback.Title[fin]}</DialogTitle>
      <DialogContent>
        <DialogContentText>{feedback.Note[fin]}</DialogContentText>
        <TextField
          id="feedback-field"
          className={classes(css.textField)}
          inputProps={{
            'data-testid': 'feedback-field',
          }}
          variant="outlined"
          multiline
          rows={3}
          onChange={(e) => setTextFeedback(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          className={classes(css.cancelButton)}
          variant="contained"
          onClick={onCloseDialog}
        >
          {feedback.Cancel[fin]}
        </Button>
        <Button
          className={classes(css.acceptButton)}
          variant="contained"
          onClick={async () => {
            onCloseDialog();
            await api.sendFeedback(textFeedback, user);
          }}
        >
          {feedback.Send[fin]}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackWindow;
