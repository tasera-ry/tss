import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import axios from 'axios';

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

  // Changes the password in database
  async function changeToDatabase(id, newpword) {
    try {
      const response = await fetch(`/api/changeownpassword/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          password: newpword,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = response.json();
      console.log(data);
      return response.ok;
    } catch (err) {
      console.error('GETTING USER FAILED', err);
      return false;
    }
  }

  // Handles the submission of password
  async function handleSubmit(e) {
    e.preventDefault();
    const secure = window.location.protocol === 'https:';

    if (oldPass === '' || newPass === '' || confirmPass === '') {
      // showAlert("error", passwordSettings.alertFields[fin]);
      alert(passwordSettings.alertFields[fin]);
    } else if (confirmPass !== newPass) {
      alert(passwordSettings.alertPwordMatch[fin]);
    } else {
      console.log('username', username);
      const name = username;
      let success = true;

      // Check if old password matches with username
      let response = await axios
        .post('api/sign', {
          name: username,
          password: oldPass,
          secure,
        })
        .catch(() => {
          alert(passwordSettings.alertWrongPword[fin]);
          success = false;
        });

      if (success) {
        // Get user's id
        const query = `api/user?name=${name}`;
        response = await axios.get(query);
        const { id } = response.data[0];

        response = await changeToDatabase(id, newPass);

        if (response) {
          alert('Success');
          setOldPass('');
          setNewPass('');
          setConfirmPass('');
        } else {
          alert('Fail');
        }
      }
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
