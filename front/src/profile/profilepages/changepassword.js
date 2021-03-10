import React from 'react';

function PasswordChange() {
    return (
        <div>
            <h1>Change password</h1>
            <form>
                <label>
                    Old password:
                    <br/>
                    <input type ="password" id="olkpword" name="oldpword"/>
                </label>
                <br/>
                <label>
                    New password:
                    <br/>
                    <input type ="password" id="newpword" name="newpword"/>
                </label>
                <br/>
                <label>
                    Confirm new password:
                    <br/>
                    <input type ="password" id="newpwordagain" name="newpwordagain"/>
                </label>
                <br/>
                <input type="submit" value="Confirm"></input>
            </form>
        </div>
    );
}

export default PasswordChange;