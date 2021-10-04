import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import api from '../../api/api';

import texts from '../../texts/texts.json';

const fin = localStorage.getItem('language');
const { passwordSettings } = texts;

// Style for title
const titleStyle = {
  margin: '20px 20px 10px 20px',
};

// Style for text field
const textStyle = {
  backgroundColor: '#fcfbf7',
  borderRadius: 4,
};

// Returns the form for password change

function PasswordChange({ username }) {
  /* eslint-disable-next-line */
  const [alertStatus, setAlert] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  /* function showAlert(status, text) {
    if(alertStatus) {
        return(

        );
    }
};
*/

  // Handles the submission of password
  async function handleSubmit(e) {
    e.preventDefault();

    if (oldPass === '' || newPass === '' || confirmPass === '') {
      alert(passwordSettings.alertFields[fin]);
      return;
    }
    if (confirmPass !== newPass) {
      alert(passwordSettings.alertPwordMatch[fin]);
      return;
    }
    const secure = window.location.protocol === 'https:';

    try {
      await api.signIn(username, oldPass, secure);
      const data = await api.getUser(username);
      try {
        await api.patchPassword(data[0].id, newPass);
        alert('Success');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
      } catch (err) {
        alert('Fail');
      }
    } catch (err) {
      alert(passwordSettings.alertWrongPword[fin]);
    }
  }

  return (
    <div>
      <Typography component="h1" variant="h5" style={titleStyle}>
        {passwordSettings.title[fin]}
      </Typography>
      <form
        className={passwordSettings.title[fin]}
        noValidate
        onSubmit={handleSubmit}
      >
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="oldpword"
          name="oldpword"
          value={oldPass}
          type="password"
          label={passwordSettings.old[fin]}
          onInput={(e) => setOldPass(e.target.value)}
          autoFocus
          style={textStyle}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="newpword"
          name="newpword"
          value={newPass}
          type="password"
          label={passwordSettings.new[fin]}
          onInput={(e) => setNewPass(e.target.value)}
          style={textStyle}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="confirmpword"
          name="confirmpword"
          value={confirmPass}
          type="password"
          label={passwordSettings.confirmNew[fin]}
          onInput={(e) => setConfirmPass(e.target.value)}
          style={textStyle}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          style={{ backgroundColor: '#5f77a1' }}
        >
          {passwordSettings.confirm[fin]}
        </Button>
      </form>
    </div>
  );
}

export default PasswordChange;
