import React from 'react';

import PasswordChange from './profilepages/changepassword';

import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import texts from '../texts/texts.json';

const fin = localStorage.getItem('language');
const { profileSettings } = texts;

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

const listStyle = {
    listStyleType: 'none',
};

// Returns the profile component, which consists of sidebar and content.

function Profile() {
    return (
        <Router>
            <div className="Profile" style={ProfileStyle}>
                <div className="ProfileSidebar" style={SidebarStyle}>
                    <ul style={listStyle}>
                        <Link to="/">
                            <li>{profileSettings.navPassword[fin]}</li>
                        </Link>
                        <li>Lorem</li>
                        <li>Ipsum</li>
                    </ul>
                </div>
                <div className="ProfileContent" style={ContentStyle}>
                    <Switch>
                        <Route path="/">
                            <PasswordChange/>
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

export default Profile;