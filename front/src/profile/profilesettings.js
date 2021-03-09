import React from 'react';

// Styles for the Profile page: The whole page, sidebar and content.

const ProfileStyle = {
    display: 'flex',
};

const SidebarStyle = {
    background: '#95d5db',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'left',
    width: 250,
    height: '100vh',
};

const ContentStyle = {
    marginLeft: '35px',
};

// Returns the profile component, which consists of sidebar and content.

function Profile() {
    return (
        <div className="Profile" style={ProfileStyle}>
            <div className="ProfileSidebar" style={SidebarStyle}>
                <ul>
                    <li>Change password</li>
                    <li>a</li>
                    <li>b</li>
                </ul>
            </div>
            <div className="ProfileContent" style={ContentStyle}>
                <h1>Change password</h1>
                <form>
                    <label>
                        Old password
                        <br/>
                        <input type ="password" id="olkpword" name="oldpword"/>
                    </label>
                    <br/>
                    <label>
                        New password
                        <br/>
                        <input type ="password" id="newpword" name="newpword"/>
                    </label>
                    <br/>
                    <label>
                        Confirm new password
                        <br/>
                        <input type ="password" id="newpwordagain" name="newpwordagain"/>
                    </label>
                    <br/>
                    <input type="submit" value="Confirm"></input>
                </form>
            </div>
        </div>
    );
}

export default Profile;