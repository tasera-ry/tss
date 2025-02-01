import { useState } from 'react';
import api from '../../../api/api';
import translations from '../../../texts/texts.json';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';

const { feedback } = translations;

const FeedbackWindow = ({ dialogOpen, onCloseDialog }) => {

  const { username } = useLoggedInUser();

  const fin = localStorage.getItem('language');
  const [textFeedback, setTextFeedback] = useState('');

  return (
    <Dialog
      aria-labelledby="title"
      open={dialogOpen}
      classes={{ paper: "bg-black-tint-05" }}
    >
      <DialogTitle id="title">{feedback.Title[fin]}</DialogTitle>
      <DialogContent>
        <DialogContentText>{feedback.Note[fin]}</DialogContentText>
        <TextField
          id="feedback-field"
          className="w-full"
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
          variant="contained"
          onClick={onCloseDialog}
        >
          {feedback.Cancel[fin]}
        </Button>
        <Button
          className="bg-sand!"
          variant="contained"
          onClick={async () => {
            onCloseDialog();
            await api.sendFeedback(textFeedback, username);
          }}
        >
          {feedback.Send[fin]}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackWindow;
