import React from 'react';
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
  Snackbar,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from '@material-ui/pickers';
import './EmailSettings.scss';
import textData from '../texts/texts.json';

const { emailSettings, nav } = textData;
const lang = localStorage.getItem('language');

const HelperText = (messageSelection) => {
  switch (messageSelection) {
    case 'declineMsg':
      return (
        <p>
          {emailSettings.dynamicValues[lang]}
          <br />
          {`{user} - ${emailSettings.userDecline[lang]}`}
          <br />
          {`{date} - ${emailSettings.declineDate[lang]}`}
        </p>
      );
    case 'feedbackMsg':
      return (
        <p>
          {emailSettings.dynamicValues[lang]}
          <br />
          {`{user} - ${emailSettings.userFeedback[lang]}`}
          <br />
          {`{feedback} - ${emailSettings.feedbackGiven[lang]}`}
        </p>
      );
    case 'resetpassMsg':  
      return (
        <p>
          {emailSettings.dynamicValues[lang]}
          <br />
          {`{token} - ${emailSettings.resetpassToken[lang]}`}
          <br />
          {emailSettings.resetpassGuide[lang]}
        </p>
      );
    case 'collageMsg':
      return (
        <p>
          {emailSettings.dynamicValues[lang]}
          <br />
          {`{assigned} - ${emailSettings.assignedCount[lang]}`}
          <br />
          {`{update} - ${emailSettings.updateCount[lang]}`}
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
    secure: 'false',
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
        if (res.status !== 200) {
          setNotification({ open: true, message: emailSettings.pendingError[lang], type: 'error' });
        }
        // Sending pending emails was successful
        else if (res.status === 200 && result.message) {
          setNotification({ open: true, message: emailSettings.pendingEmpty[lang], type: 'success' });
        } else {
          setNotification({ open: true, message: emailSettings.pendingSuccess[lang], type: 'success' });
        }
        })
      .catch((error) => {
        setPendingSave(false);
        console.error('Sending pending emails failed:', error);
        setNotification({ open: true, message: emailSettings.pendingError[lang], type: 'error' });
      });
  };

  // Runs the above whenever the page loads
  React.useEffect(fetchAndSetSettings, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };
  const handleDateChange = (date) => {
    const newDate = new Date();
    newDate.setHours(date.getHours(), date.getMinutes());
    setSettings({ ...settings, sendPendingTime: newDate });
  };

  // Checks user field is a tasera email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // A function that saves the email settings to the database
  const handleSubmit = async (e) => {
    e.preventDefault();
    // If email is not @tasera.fi
    if (!validateEmail(settings.user)) {
      setNotification({ open: true, message: emailSettings.emailError[lang], type: 'error' });
      return;
    }
    else if (settings.pass === '') {
      setNotification({ open: true, message: emailSettings.passError[lang], type: 'error' });
      return;
    }
    else if (settings.host !== 'smtp.gmail.com') {
      setNotification({ open: true, message: emailSettings.hostError[lang], type: 'error' });
      return;
    }
    else if (settings.port !== '465' && settings.port !== '587') {
      setNotification({ open: true, message: emailSettings.portError[lang], type: 'error' });
      return;
    }
    // If port number and radiobutton are not compatible
    else if ((settings.port === '465' && settings.secure === 'false')
              || (settings.port === '587' && settings.secure === 'true')) {
      setNotification({ open: true, message: emailSettings.secureError[lang], type: 'error' });
      return;
    }

    setPendingSave(true);

    // Verify email credentials and save settings to the database
    fetch('/api/email-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
      .then((res) => {
        // Wrong username or password
        if (res.status !== 200) {
          throw Error(res.statusText);
        }
        // Verifying credentials was successful, settings saved
        else {
          setPendingSave(false);
          setNotification({ open: true, message: emailSettings.success[lang], type: 'success' });
        }
      })
      .catch((err) => {
        console.log('Veryfying email credentials unsuccessful. Wrong email or password. ' + err);
        setPendingSave(false);
        setNotification({ open: true, message: emailSettings.credError[lang], type: 'error' });
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
        <FormLabel component="legend">{nav.EmailSettings[lang]}</FormLabel>
        <FormControl component="fieldset">
          <FormLabel>SMTP-asetukset</FormLabel>
          <TextField
            name="host"
            label="Host"
            value={settings.host}
            onChange={handleChange}
          />
          <TextField
            name="port"
            label="Port"
            type="number"
            value={settings.port}
            onChange={handleChange}
          />
          <TextField
            name="user"
            label={emailSettings.user[lang]}
            value={settings.user}
            onChange={handleChange}
          />
          <TextField
            name="pass"
            label={emailSettings.pass[lang]}
            value={settings.pass}
            type="password"
            onChange={handleChange}
            autoComplete="new-password"
          />
          <FormHelperText>{emailSettings.ssl[lang]}</FormHelperText>
          <RadioGroup
            name="secure"
            value={settings.secure}
            onChange={handleChange}
          >
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={emailSettings.no[lang]}
            />
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={emailSettings.yes[lang]}
            />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {emailSettings.senderAddress[lang]}
          </FormLabel>
          <TextField
            name="sender"
            label={emailSettings.address[lang]}
            value={settings.sender}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {emailSettings.emailMessages[lang]}
          </FormLabel>
          <Select
            value={messageSelection}
            onChange={(e) => setMessageSelection(e.target.value)}
            label="Message type"
          >
            <MenuItem value="collageMsg">
              {emailSettings.collage[lang]}
            </MenuItem>
            <MenuItem value="assignedMsg">
              {emailSettings.assigned[lang]}
            </MenuItem>
            <MenuItem value="updateMsg">{emailSettings.update[lang]}</MenuItem>
            <MenuItem value="reminderMsg">
              {emailSettings.reminder[lang]}
            </MenuItem>
            <MenuItem value="declineMsg">
              {emailSettings.decline[lang]}
            </MenuItem>
            <MenuItem value="feedbackMsg">
              {emailSettings.feedback[lang]}
            </MenuItem>
            <MenuItem value="resetpassMsg">
              {emailSettings.resetpass[lang]}
            </MenuItem>
          </Select>
          <TextField
            multiline
            name={messageSelection}
            label={emailSettings.emailContent[lang]}
            value={settings[messageSelection]}
            onChange={handleChange}
          />
          <FormHelperText display="inline" component="div">
            {HelperText(messageSelection)}
          </FormHelperText>
        </FormControl>
        <FormControl component="fieldset">
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
              margin="normal"
              label={emailSettings.pendingTime[lang]}
              value={settings.sendPendingTime}
              onChange={handleDateChange}
            />
          </MuiPickersUtilsProvider>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {emailSettings.queueMessages[lang]}
          </FormLabel>
          <RadioGroup
            name="shouldQueue"
            value={settings.shouldQueue}
            onChange={handleChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={emailSettings.yes[lang]}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={emailSettings.no[lang]}
            />
          </RadioGroup>
          <Button
            variant="contained"
            style={{ color: 'black', backgroundColor: '#d1ccc2' }}
            id="send-pending-button"
            onClick={sendPendingRequest}
          >
            {pendingSend ? (
              <CircularProgress />
            ) : (
              emailSettings.sendPending[lang]
            )}
          </Button>
          <FormHelperText display="inline">
            {emailSettings.sendPendingTip[lang]}
          </FormHelperText>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel className="settings-label">
            {emailSettings.sendAutomatically[lang]}
          </FormLabel>
          <RadioGroup
            name="shouldSend"
            value={settings.shouldSend}
            onChange={handleChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={emailSettings.yes[lang]}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={emailSettings.no[lang]}
            />
          </RadioGroup>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          style={{ color: 'black', backgroundColor: '#d1ccc2' }}
        >
          {pendingSave ? (
            <CircularProgress />
          ) : (
            emailSettings.saveSettings[lang]
          )}
        </Button>
      </form>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EmailSettings;