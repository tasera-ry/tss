import React from 'react';

import axios from 'axios';

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
        let name = username.username;

        let query = `api/user?name=${name}`;
        let response = await axios.get(query);

        let id = response.data[0].id;
        console.log(id);

        response = await changeToDatabase(id, newpword);
        console.log(response);
        if(response){
            alert("Success");
        } else {
            alert("Fail");
        }
    }
}

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