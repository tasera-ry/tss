import { useState } from 'react';
import api from '../../../api/api';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { t } from '@lingui/core/macro';

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
      <DialogTitle id="title">{t`Give feedback`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t`Write in the textbox below the feedback you received from the range. Remember to identify the track if the feedback is for a certain track. The feedback will be sent to the superusers.`}
        </DialogContentText>
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
          {t`Cancel`}
        </Button>
        <Button
          className="bg-sand!"
          variant="contained"
          onClick={async () => {
            onCloseDialog();
            await api.sendFeedback(textFeedback, username);
          }}
        >
          {t`Send`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackWindow;
