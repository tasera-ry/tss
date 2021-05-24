import React from 'react';

import PasswordChange from './profilepages/changepassword';

import { Link } from 'react-router-dom';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import texts from '../texts/texts.json';
import { List, ListItem } from '@material-ui/core';

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
    padding: 10,
};

const elementStyle = {
    color: 'black',
    textDecoration: 'none',
    fontWeight: 'bold',
};

// Returns the profile component, which consists of sidebar and content.

function Profile() {
    const [cookies] = useCookies(['username']);
    return (
        <Router>
            <div className="Profile" style={ProfileStyle}>
                <div className="ProfileSidebar" style={SidebarStyle}>
                    <List style={listStyle}>
                        {/* When new profile features are added, change path*/}
                        <Link style={elementStyle} to="/profile">
                            <ListItem button>
                                {profileSettings.navPassword[fin]}
                            </ListItem>
                        </Link>
                    </List>
                </div>
                <div className="ProfileContent" style={ContentStyle}>
                    <Switch>
                        <Route path="/">
                            <PasswordChange username={cookies.username}/>
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

export default Profile;