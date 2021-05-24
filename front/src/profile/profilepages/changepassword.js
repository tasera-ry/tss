import React, { useState } from 'react';

import axios from 'axios';

import texts from '../../texts/texts.json';

const fin = localStorage.getItem('language');
const { passwordSettings } = texts;

// Returns the form for password change

function PasswordChange(username) {
    const [alertStatus, setAlert] = useState("");
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

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
        let response = await fetch(`/api/changeownpassword/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                password: newpword,
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return response.ok;
    } catch (err) {
        console.error('GETTING USER FAILED', err);
        return false;
    }
}

// Handles the submission of password
async function handleSubmit(username, e) {
    e.preventDefault();
    const secure = window.location.protocol === 'https:';

    if((oldPass==="")||(newPass==="")||(confirmPass==="")) {
        // showAlert("error", passwordSettings.alertFields[fin]);
        alert(passwordSettings.alertFields[fin]);
    } else if(confirmPass !== newPass) {
        alert(passwordSettings.alertPwordMatch[fin]);
    } else {
        let name = username.username;
        let success = true;
        
        // Check if old password matches with username
        let response = await axios.post('api/sign', {
            name: name,
            password: oldPass,
            secure
        })
        .catch(() => {
            alert(passwordSettings.alertWrongPword[fin]);
            success = false;
        });

        if(success) {
            // Get user's id
            let query = `api/user?name=${name}`;
            response = await axios.get(query);
            let id = response.data[0].id;

            response = await changeToDatabase(id, newPass);
            
            if(response){
                alert("Success");
                setOldPass("");
                setNewPass("");
                setConfirmPass("");
            } else {
                alert("Fail");
            }
        }
    }
}
    return (
        <div>
            <h1>{passwordSettings.title[fin]}</h1>
            <form>
                <label>
                    {passwordSettings.old[fin]}
                    <br/>
                    <input type ="password" id="oldpword" name="oldpword" value={oldPass} onChange={({ target }) => setOldPass(target.value)}/>
                </label>
                <br/>
                <label>
                    {passwordSettings.new[fin]}
                    <br/>
                    <input type ="password" id="newpword" name="newpword" value={newPass} onChange={({ target }) => setNewPass(target.value)}/>
                </label>
                <br/>
                <label>
                    {passwordSettings.confirmNew[fin]}
                    <br/>
                    <input type ="password" id="newpwordagain" name="newpwordagain" value={confirmPass} onChange={({ target }) => setConfirmPass(target.value)}/>
                </label>
                <br/>
                <input type="submit" onClick={handleSubmit.bind(this, username)} value={passwordSettings.confirm[fin]}></input>
            </form>
        </div>
    );
}

export default PasswordChange;