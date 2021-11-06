import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../../api/api';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import translations from '../../texts/texts.json';
import css from './ChangePassword.module.scss';

const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { passwordSettings } = translations;

const ChangePassword = ({ username }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (oldPass === '' || newPass === '' || confirmPass === '') {
      alert(passwordSettings.alertFields[lang]);
      return;
    }
    if (confirmPass !== newPass) {
      alert(passwordSettings.alertPwordMatch[lang]);
      return;
    }

    try {
      const secure = window.location.protocol === 'https:';
      await api.signIn(username, oldPass, secure);
    } catch (err) {
      alert(passwordSettings.alertWrongPword[lang]);
    }
    try {
      const data = await api.getUser(username);
      await api.patchPassword(data[0].id, newPass);
      alert(passwordSettings.alertSuccess[lang]);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      alert(passwordSettings.alertFail[lang]);
    }
  };

  const textFields = [
    {
      name: 'oldpword',
      value: oldPass,
      label: passwordSettings.old[lang],
      changeValue: (value) => setOldPass(value),
    },
    {
      name: 'newpword',
      value: newPass,
      label: passwordSettings.new[lang],
      changeValue: (value) => setNewPass(value),
    },
    {
      name: 'confirmpword',
      value: confirmPass,
      label: passwordSettings.confirmNew[lang],
      changeValue: (value) => setConfirmPass(value),
    },
  ];

  return (
    <div>
      <div className={classes(css.title)}>
        <Typography component="h1" variant="h5">
          {passwordSettings.title[lang]}
        </Typography>
      </div>
      <form
        className={passwordSettings.title[lang]}
        noValidate
        onSubmit={handleSubmit}
      >
        {textFields.map(({ name, value, label, changeValue }, idx) => (
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            autofocus={idx === 0} // autofocus on first field
            id={name}
            name={name}
            value={value}
            type="password"
            label={label}
            onInput={(e) => changeValue(e.target.value)}
            className={classes(css.textField)}
          />
        ))}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className={classes(css.acceptButton)}
        >
          {passwordSettings.confirm[lang]}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
