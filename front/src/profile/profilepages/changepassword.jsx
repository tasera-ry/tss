import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import React, { useState } from 'react';
import api from '../../api/api';
import css from './ChangePassword.module.scss';

const classes = classNames.bind(css);

const ChangePassword = ({ username, id }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (oldPass === '' || newPass === '' || confirmPass === '') {
      alert(t`Fill all the text fields`);
      return;
    }
    if (confirmPass !== newPass) {
      alert(t`Confirmation doesn't match the new password`);
      return;
    }

    try {
      const secure = window.location.protocol === 'https:';
      await api.signIn(username, oldPass, secure);
    } catch (err) {
      alert(t`Old password isn't valid`);
    }
    try {
      const data = await api.getUser(id);
      await api.patchPassword(data[0].id, newPass);
      alert(t`Password change successful`);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      alert(t`Password change failed`);
    }
  };

  const textFields = [
    {
      name: 'oldpword',
      value: oldPass,
      label: t`Old password`,
      changeValue: (value) => setOldPass(value),
    },
    {
      name: 'newpword',
      value: newPass,
      label: t`New password`,
      changeValue: (value) => setNewPass(value),
    },
    {
      name: 'confirmpword',
      value: confirmPass,
      label: t`Confirm new password`,
      changeValue: (value) => setConfirmPass(value),
    },
  ];

  return (
    <div>
      <div className={classes(css.title)}>
        <Typography component="h1" variant="h5">
          {t`Change password`}
        </Typography>
      </div>
      <form className={t`Change password`} noValidate onSubmit={handleSubmit}>
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
