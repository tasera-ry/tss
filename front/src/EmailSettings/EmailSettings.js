import React from 'react';
import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Button,
    TextField,
    FormHelperText } from '@material-ui/core';
import './EmailSettings.css';
import { nav } from '../texts/texts.json';

const lang = localStorage.getItem('language');

/**
 * Returns a page for specifying and submitting email-settings.
 * Makes an API call to get the current settings and sets them on the page every time the page loads (ignoring undefined values).
 * On submit it makes another API call to set the specified settings on the server
 */
const EmailSettings = () => {
    const [settings, setSettings] = React.useState({
        sender: "",
        user: "",
        pass: "",
        host: "",
        port: 0,
        secure: "false",
        shouldSend: "true"
    });

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
        fetch("api/email-settings", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(settings)
        });
    };
    // All hard coded text parts should be replaced by getting them based on language
    return (
        <div className="email-settings">
            <form className="settings-form" onSubmit={handleSubmit}>
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
                        label="User"
                        value={settings.user}
                        onChange={handleChange}
                    />
                    <TextField
                        name="pass"
                        label="Pass"
                        value={settings.pass}
                        type="password"
                        onChange={handleChange}
                    />
                    <FormHelperText>Secure</FormHelperText>
                    <RadioGroup
                        name="secure"
                        value={settings.secure}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="false" control={<Radio />} label="False" />
                        <FormControlLabel value="true" control={<Radio />} label="True" />
                    </RadioGroup>
                    <FormLabel className="settings-label">Sähköpostin lähettäjän osoite</FormLabel>
                    <TextField
                        name="sender"
                        label="Sender"
                        value={settings.sender}
                        onChange={handleChange}
                    />
                    <FormLabel className="settings-label">Lähetä sähköpostia automaattisesti</FormLabel>
                    <RadioGroup
                        name="shouldSend"
                        value={settings.shouldSend}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="Kyllä" />
                        <FormControlLabel value="false" control={<Radio />} label="Ei" />
                    </RadioGroup>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </FormControl>
            </form>
        </div>
    );
};

export default EmailSettings;