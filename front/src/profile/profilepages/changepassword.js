import React from 'react';

import texts from '../../texts/texts.json';

const fin = localStorage.getItem('language');
const { passwordSettings } = texts;

// Handles the submission of password

async function handleSubmit(username, e) {
    e.preventDefault();
    const secure = window.location.protocol === 'https:';
    
    let oldpword = document.getElementById("oldpword").value;
    let newpword = document.getElementById("newpword").value;
    let newpwordagain = document.getElementById("newpwordagain").value;

    if((oldpword==="")||(newpword==="")||(newpwordagain==="")) {
        alert(passwordSettings.alertFields[fin]);
    } else if(newpwordagain !== newpword) {
        alert(passwordSettings.alertPwordMatch[fin]);
    } else {
        let test = username.username;
        console.log(test);
        let response = await changeToDatabase(test, newpword);
        console.log(response);
    }
}

// Changes the password in database

async function changeToDatabase(id, newpword) {
    try {
        let response = await fetch(`/api/user/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                password: newpword
            }),
            headers: {
                Accept: 'application/json',
                ContentType: 'application/json'
            }
        });
        return response.ok;
    } catch (err) {
        console.error('GETTING USER FAILED', err);
        return false;
    }
}

// Returns the form for password change

function PasswordChange(username) {
    return (
        <div>
            <h1>{passwordSettings.title[fin]}</h1>
            <form>
                <label>
                    {passwordSettings.old[fin]}
                    <br/>
                    <input type ="password" id="oldpword" name="oldpword"/>
                </label>
                <br/>
                <label>
                    {passwordSettings.new[fin]}
                    <br/>
                    <input type ="password" id="newpword" name="newpword"/>
                </label>
                <br/>
                <label>
                    {passwordSettings.confirmNew[fin]}
                    <br/>
                    <input type ="password" id="newpwordagain" name="newpwordagain"/>
                </label>
                <br/>
                <input type="submit" onClick={handleSubmit.bind(this, username)} value={passwordSettings.confirm[fin]}></input>
            </form>
        </div>
    );
}

export default PasswordChange;