import React from 'react';
import moment from 'moment';
import Snackbar from '@mui/material/Snackbar';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Button,
  TextField,
  FormHelperText,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  LocalizationProvider,
  TimePicker,
} from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import './EmailSettings.scss';

const HelperText = (messageSelection) => {
  switch (messageSelection) {
    case 'declineMsg':
      return (
        <p>
          {t`Allowed dynamic values:`}
          <br />
          {`{user} - ${t`The user who declined`}`}
          <br />
          {`{date} - ${t`The date of the user declining`}`}
        </p>
      );
    case 'feedbackMsg':
      return (
        <p>
          {t`Allowed dynamic values:`}
          <br />
          {`{user} - ${t`The user who gave feedback`}`}
          <br />
          {`{feedback} - ${t`The feedback given by the user`}`}
        </p>
      );
    case 'resetpassMsg':  
      return (
        <p>
          {t`Allowed dynamic values:`}
          <br />
          {`{token} - ${t`The password reset link token.`}`}
          <br />
          {t`The link can be made like this: http://tss.tasera.fi/#/renew-password/{token}`}
        </p>
      );
    case 'collageMsg':
      return (
        <p>
          {t`Allowed dynamic values:`}
          <br />
          {`{assigned} - ${t`The number of assigned shifts`}`}
          <br />
          {`{update} - ${t`The number of updated shifts`}`}
        </p>
      );
    case 'assignedMsg':
    case 'updateMsg':
    case 'reminderMsg':
    default:
      return <p />;
  }
};

/**
 * Returns a page for specifying and submitting email-settings.
 * Makes an API call to get the current settings and
 * sets them on the page every time the page loads (ignoring undefined values).
 * On submit it makes another API call to set the specified settings on the server
 */
const EmailSettings = () => {
  const [pendingSave, setPendingSave] = React.useState(false);
  const [pendingSend, setPendingSend] = React.useState(false);
  const [settings, setSettings] = React.useState({
    sender: '',
    user: '',
    pass: '',
    host: '',
    port: 0,
    cc: '',
    secure: 'true',
    shouldQueue: 'false',
    shouldSend: 'true',
    assignedMsg: '',
    updateMsg: '',
    reminderMsg: '',
    declineMsg: '',
    feedbackMsg: '',
    resetpassMsg: '',
    collageMsg: '',
    sendPendingTime: new Date(0),
  });
  const [messageSelection, setMessageSelection] = React.useState('collageMsg');
  const [notification, setNotification] = React.useState({ open: false, message: '', type: 'info' });

  const fetchAndSetSettings = () => {

    fetch('/api/email-settings')
      .then((res) => res.json())
      .then((data) => {
        const filteredData = {};
        Object.keys(settings).forEach((key) => {
          if (data[key] !== undefined && data[key] !== null)
            filteredData[key] = data[key];
          else filteredData[key] = settings[key];
        });
        setSettings(filteredData);
      });
  };

  // Sends all pending emails
  const sendPendingRequest = () => {
    setPendingSend(true);
    fetch('/api/send-pending')
      .then(async (res) => {
        const result = await res.json();
        setPendingSend(false);
        // Sending pending emails failed
        if(res.status === 404) {
          // no pending emails to send
          setNotification({ open: true, message: t`No pending messages to send.`, type: 'success' });
        }
        else if (res.status !== 200) {
          setNotification({ open: true, message: t`Sending pending messages failed!`, type: 'error' });
        }
        // Sending pending emails was successful
        else if (res.status === 200 && result.message) {
          setNotification({ open: true, message: t`No pending messages to send.`, type: 'success' });
        } else {
          setNotification({ open: true, message: t`Pending messages sent successfully!`, type: 'success' });
        }
        })
      .catch((error) => {
        setPendingSave(false);
        console.error('Sending pending emails failed:', error);
        setNotification({ open: true, message: t`Sending pending messages failed!`, type: 'error' });
      });
  };

  // Runs the above whenever the page loads
  React.useEffect(fetchAndSetSettings, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };
  const handleDateChange = (date) => {
    const newDate = new Date();
    // FIXME: for whatever reason the number gets decremented by 2 at some point.
    // No time to fix now
    newDate.setHours(date.hours(), date.minutes());
    setSettings({ ...settings, sendPendingTime: newDate });
  };

  // Checks if email is given in email format. For example includes '@'
  // and characters before and after if.
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // A function that saves the email settings to the database
  const handleSubmit = async (e) => {
    e.preventDefault();
    // If email isn't in email format
    if (!validateEmail(settings.user)) {
      setNotification({ open: true, message: t`Invalid email!`, type: 'error' });
      return;
    }
    else if (!settings.pass) {
      setNotification({ open: true, message: t`Password cannot be empty!`, type: 'error' });
      return;
    }
    else if (!settings.host) {
      setNotification({ open: true, message: t`Host cannot be empty!`, type: 'error' });
      return;
    }
    else if (!settings.port) {
      setNotification({ open: true, message: t`Port cannot be zero!`, type: 'error' });
      return;
    }
    else if (settings.cc && !validateEmail(settings.cc)) {
      setNotification({ open: true, message: t`Invalid CC email!`, type: 'error' });
      return;
    }

    setPendingSave(true);

    // Verify email credentials and save settings to the database
    fetch('/api/email-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
      .then(async (res) => {
        // If veryfying credentials failed
        if (res.status !== 200) {
          const data = await res.json();
          setPendingSave(false);
          // Handle specific errors
          if (data.code === 'EAUTH') {
            setNotification({ open: true, message: t`Wrong email or password!`, type: 'error' });
          } else if (data.code === 'EDNS') {
            setNotification({ open: true, message: t`DNS resolution failed. Please check that the SMTP host is correct.`, type: 'error' });
          } else if (data.code === 'ESOCKET') {
            setNotification({ open: true, message: t`Connection failed. Please check the server, port, and SSL settings.`, type: 'error' });
          } else if (data.code === 'ETIMEDOUT') {
            setNotification({ open: true, message: t`Connection timed out. Check network connectivity.!`, type: 'error' });
          } else {
            console.error('Saving email settings failed:', data);
            throw new Error("Unrecognized error code: " + data.code);
          }
        }
        // Verifying credentials was successful, settings saved
        else {
          setPendingSave(false);
          setNotification({ open: true, message: t`Successfully updated!`, type: 'success' });
        }
      })
      // Unrecognized error
      .catch((error) => {
        console.log('Saving email settings failed:', error);
        setPendingSave(false);
        setNotification({ open: true, message: t`Something went wrong!`, type: 'error' });
      });
  };

  // Closes the pop up notification
  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', type: 'info' });
  };
  
  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  return (
    <div className="email-settings">
      <form onSubmit={handleSubmit}>
        <div className="group">
          <FormLabel component="legend">{t`Email settings`}</FormLabel>
          <FormControl component="fieldset">
            <FormLabel>SMTP-asetukset</FormLabel>
            <TextField
              className="component"
              name="host"
              label="Host"
              value={settings.host}
              onChange={handleChange}
            />
            <TextField
              className="component"
              name="port"
              label="Port"
              type="number"
              value={settings.port}
              onChange={handleChange}
            />
            <TextField
              className="component"
              name="user"
              label={t`Email`}
              value={settings.user}
              onChange={handleChange}
            />
            <TextField
              className="component"
              name="pass"
              label={t`Password`}
              value={settings.pass}
              type="password"
              onChange={handleChange}
              autoComplete="new-password"
            />
            <TextField
              className="component"
              name="cc"
              label={t`CC`}
              value={settings.cc}
              onChange={handleChange}
            />
          </FormControl>
        </div>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {t`Use SSL`}
          </FormLabel>
          <RadioGroup
            name="secure"
            value={settings.secure}
            onChange={handleChange}
          >
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={t`No`}
            />
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={t`Yes`}
            />
          </RadioGroup>
        </FormControl>
        <div className="group">
          <FormControl component="fieldset">
            <FormLabel className="settings-label">
              {t`Sender email address`}
            </FormLabel>
            <TextField
              className="component"
              name="sender"
              label={t`Address`}
              value={settings.sender}
              onChange={handleChange}
            />
          </FormControl>
        </div>
        <div className="group">
            <FormLabel className="settings-label">
              {t`Email messages`}
            </FormLabel>
            <FormControl component="fieldset">
            <InputLabel id="message-type-label">
              {t`Message type`}
            </InputLabel>
            <Select
              labelId="message-type-label"
              label={t`Message type`}
              value={messageSelection}
              onChange={(e) => setMessageSelection(e.target.value)}
            >
              <MenuItem value="collageMsg">
                {t`Compiled shift changes`}
              </MenuItem>
              <MenuItem value="assignedMsg">
                {t`Shift assigned`}
              </MenuItem>
              <MenuItem value="updateMsg">{t`Shift updated`}</MenuItem>
              <MenuItem value="reminderMsg">
                {t`Unconfirmed shift reminder`}
              </MenuItem>
              <MenuItem value="declineMsg">
                {t`Shift declined`}
              </MenuItem>
              <MenuItem value="feedbackMsg">
                {t`Feedback received`}
              </MenuItem>
              <MenuItem value="resetpassMsg">
                {t`Password reset link`}
              </MenuItem>
            </Select>
            <TextField
              className="component"
              multiline
              name={messageSelection}
              label={t`Message content`}
              value={settings[messageSelection]}
              onChange={handleChange}
            />
            <FormHelperText display="inline" component="div">
              {HelperText(messageSelection)}
            </FormHelperText>
          </FormControl>
        </div>
        <div className="group">
          <FormControl component="fieldset" className="component">
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <TimePicker
                className="component"
                margin="normal"
                label={t`Time for sending emails`}
                value={moment(settings.sendPendingTime)}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </FormControl>
        </div>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {t`Send compiled messages at a certain time`}
          </FormLabel>
          <RadioGroup
            name="shouldQueue"
            value={settings.shouldQueue}
            onChange={handleChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={t`Yes`}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={t`No`}
            />
          </RadioGroup>
        </FormControl>
        <div className="group">
          <FormControl component="fieldset" className="component">
            <Button
              variant="contained"
              style={{ color: 'black', backgroundColor: '#d1ccc2' }}
              id="send-pending-button"
              onClick={sendPendingRequest}
            >
              {pendingSend ? (
                <CircularProgress />
              ) : (
                t`Send messages`
              )}
            </Button>
            <FormHelperText display="inline" className="helperText">
              {t`You can force all pending emails to be sent immediately with the button.`}
            </FormHelperText>
          </FormControl>
        </div>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {t`Send email`}
          </FormLabel>
          <RadioGroup
            name="shouldSend"
            value={settings.shouldSend}
            onChange={handleChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={t`Yes`}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={t`No`}
            />
          </RadioGroup>
        </FormControl>
        <div className="group">
          <FormControl component="fieldset" className="component">
            <Button
              type="submit"
              variant="contained"
              style={{ color: 'black', backgroundColor: '#d1ccc2' }}
            >
              {pendingSave ? (
                <CircularProgress />
              ) : (
                t`Save settings`
              )}
            </Button>
          </FormControl>
        </div>
      </form>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div>
          <Alert onClose={handleCloseNotification} severity={notification.type}>
            {notification.message}
          </Alert>
        </div>
      </Snackbar>
    </div>
  );
};

export default EmailSettings;
