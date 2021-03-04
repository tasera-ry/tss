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
    MenuItem } from '@material-ui/core';
import './EmailSettings.css';
import { emailSettings, nav } from '../texts/texts.json';

const lang = localStorage.getItem('language');

/**
 * Returns a page for specifying and submitting email-settings.
 * Makes an API call to get the current settings and sets them on the page every time the page loads (ignoring undefined values).
 * On submit it makes another API call to set the specified settings on the server
 */
const EmailSettings = () => {
    const [pending, setPending] = React.useState(false);
    const [settings, setSettings] = React.useState({
        sender: "",
        user: "",
        pass: "",
        host: "",
        port: 0,
        secure: "false",
        shouldSend: "true",
        assignedMsg: "",
        updateMsg: "",
        reminderMsg: "",
        declineMsg: "",
        feedbackMsg: "",
    });
    const [resultMessages, setResultMessages] = React.useState([]);
    const [messageSelection, setMessageSelection] = React.useState("assignedMsg");

    const fetchAndSetSettings = () => {
        fetch("/api/email-settings")
            .then(res => res.json())
            .then(data => {
                const filteredData = {};
                Object.keys(settings).forEach(key => {
                    if (data[key] !== undefined && data[key] !== null)
                        filteredData[key] = data[key];
                    else
                        filteredData[key] = settings[key];
                });
                setSettings(filteredData);
            });
    };
    /* Runs the above whenever the page loads */
    React.useEffect(fetchAndSetSettings, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setPending(true);
        fetch("api/email-settings", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(settings)
        }).then(res => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                setPending(false);
                setResultMessages(prevArr => [...prevArr, {success: true, msg: emailSettings.success[lang]}]);
            }
        }).catch(e => {
            console.log(e);
            setPending(false);
            setResultMessages(prevArr => [...prevArr, {success: false, msg: e.message}]);
        });
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
                    />
                    <FormHelperText>{emailSettings.ssl[lang]}</FormHelperText>
                    <RadioGroup
                        name="secure"
                        value={settings.secure}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="false" control={<Radio />} label={emailSettings.no[lang]} />
                        <FormControlLabel value="true" control={<Radio />} label={emailSettings.yes[lang]} />
                    </RadioGroup>
                </FormControl>
                <FormControl component="fieldset">
                    <FormLabel className="settings-label">{emailSettings.senderAddress[lang]}</FormLabel>
                    <TextField
                        name="sender"
                        label={emailSettings.address[lang]}
                        value={settings.sender}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl component="fieldset">
                    <FormLabel className="settings-label">Email messages</FormLabel>
                    <Select
                        value={messageSelection}
                        onChange={(e) => setMessageSelection(e.target.value)}
                        label="Message type"
                    >
                        <MenuItem value={"assignedMsg"}>Assigned</MenuItem>
                        <MenuItem value={"updateMsg"}>Updated</MenuItem>
                        <MenuItem value={"reminderMsg"}>Reminder</MenuItem>
                        <MenuItem value={"declineMsg"}>Declined</MenuItem>
                        <MenuItem value={"feedbackMsg"}>Feedback</MenuItem>
                    </Select>
                    <TextField
                        multiline
                        name={messageSelection}
                        label="Email content"
                        value={settings[messageSelection]}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl component="fieldset">
                    <FormLabel className="settings-label">{emailSettings.sendAutomatically[lang]}</FormLabel>
                    <RadioGroup
                        name="shouldSend"
                        value={settings.shouldSend}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="Kyllä" />
                        <FormControlLabel value="false" control={<Radio />} label="Ei" />
                    </RadioGroup>
                </FormControl>
                <Button type="submit" variant="contained" color="primary">
                    {pending ? <CircularProgress /> : emailSettings.saveSettings[lang]}
                </Button>
            </form>
            <div className="results-div">
                {resultMessages.map((result, index) => (
                    <Card className="result-card" key={index}>
                        <CardContent className={result.success ? "result-success" : "result-failure"}>
                            {result.msg}
                        </CardContent>
                        <CardActions>
                            <Button
                                size="small"
                                onClick={() => setResultMessages(resultMessages.filter((val, i) => i !== index))}
                            >
                                {emailSettings.close[lang]}
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default EmailSettings;