import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import translations from '../texts/texts.json';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import colors from '../colors.module.scss';
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
          style={{ backgroundColor: colors.cream10 }}
          className={classes(css.cancelButton)}
          variant="contained"
          onClick={onCloseDialog}
        >
          {feedback.Cancel[fin]}
        </Button>
        <Button
          style={{ backgroundColor: colors.blue }}
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
