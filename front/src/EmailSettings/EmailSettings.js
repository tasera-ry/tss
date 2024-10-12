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
  Card,
  CardActions,
  CardContent,
  Select,
  MenuItem,
  Snackbar,
} from '@material-ui/core';
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
  const [resultMessages, setResultMessages] = React.useState([]);
  const [resultCounter, setResultCounter] = React.useState(0);
  const [messageSelection, setMessageSelection] = React.useState('collageMsg');
  const [notification, setNotification] = React.useState({ open: false, message: '' });

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
  const sendPendingRequest = () => {
    setPendingSend(true);
    fetch('/api/send-pending').then(() => {
      setPendingSend(false);
    });
  };
  /* Runs the above whenever the page loads */
  React.useEffect(fetchAndSetSettings, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };
  const handleDateChange = (date) => {
    const newDate = new Date();
    newDate.setHours(date.getHours(), date.getMinutes());
    setSettings({ ...settings, sendPendingTime: newDate });
  };

  // checks whether the email in sähköpostiasetukset käyttäjä/user field is a tasera email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(settings.user)) { // checks if the email is a tasera email
      console.log('Invalid email!');
      setNotification({ open: true, message: 'Invalid email. Needs to be a tasera.fi email!' });
      return;
    } 
    if (!settings.pass) { // checks if the password field is empty
      console.log('Password is empty!');
      setNotification({ open: true, message: 'Password cannot be empty!' });
      return;
    }
    console.log('email was correct');
    setNotification({ open: true, message: 'Email was correct. Settings saved!' });
    setPendingSave(true);
    fetch('api/email-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
      .then((res) => {
        if (res.status !== 200) {
          throw Error(res.statusText);
        } else {
          setPendingSave(false);
          setResultCounter(resultCounter + 1);
          setResultMessages((prevArr) => [
            ...prevArr,
            {
              success: true,
              msg: emailSettings.success[lang],
              id: resultCounter,
            },
          ]);
        }
      })
      .catch((err) => {
        console.log(err);
        setPendingSave(false);
        setResultCounter(resultCounter + 1);
        setResultMessages((prevArr) => [


          ...prevArr,
          {
            success: false,
            msg: err.message,
            id: resultCounter,
          },
        ]);
      });
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '' });
  };

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

      <div className="results-div">
        {resultMessages.map((result, index) => (
          <Card className="result-card" key={result.id}>
            <CardContent
              className={result.success ? 'result-success' : 'result-failure'}
            >
              {result.msg}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() =>
                  setResultMessages(
                    resultMessages.filter((val, i) => i !== index),
                  )
                }
              >
                {emailSettings.close[lang]}
              </Button>
            </CardActions>
          </Card>
        ))}
      </div>
      <Snackbar // notification for invalid/valid email
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message={notification.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // positioning higher
        ContentProps={{
          style: {
            backgroundColor: notification.message.includes('correct') ? '#4caf50' : '#f44336',
          },
        }}
      />
    </div>
  );
};

export default EmailSettings;
