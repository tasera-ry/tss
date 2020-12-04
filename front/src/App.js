import React, { Component, useState } from 'react';

import './App.css';

// Custom components
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { CookiesProvider, withCookies } from 'react-cookie';
import SignIn from './signin/SignIn';
import Nav from './navbar/Nav';
import Dayview from './dayview/Dayview';
import Weekview from './weekview/Weekview';
import Trackview from './trackview/Trackview';
import Scheduling from './scheduling/Scheduling';
import RangeOfficerView from './tabletview/rangeofficer';
import UserManagementView from './usermanagement/UserManagementView';
import TrackCRUD from './edittracks/tracks';

// React router. Hashrouter, because normal router won't work in apache

import { validateLogin } from './utils/Utils';
import axios from 'axios';

/*
   The main component of the whole project.
*/
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cookies: this.props.allCookies,
      removeCookie: this.props.cookies.remove
    }
  }

  // TODO: this works, but flashes if invalid
  componentDidMount() {
    if (this.state.cookies.username) {
      validateLogin()
        .then(async (tokenValid) => {
          // If the token is expired, logout user
          if (!tokenValid) {
            const response = await axios.post('/api/signout');
            this.props.cookies.remove('username');
            this.props.cookies.remove('role');

            window.location.reload();
          }
        });
    }
  }

  render() {
    if (localStorage.getItem('language') === null) {
      localStorage.setItem('language', 0);
    }
    return (
      <CookiesProvider>
        <Router>
          <div className="App">
            <header className="App-header">
              <Nav/>
              <Switch>
                <Route path="/" exact component={Weekview} />
                <Route path="/signin" component={SignIn} />
                <Route path="/dayview/:date?" component={Dayview} />
                <Route path="/weekview" component={Weekview} />
                <Route path="/trackview/:date?/:track?" component={Trackview} />
                <Route path="/scheduling/:date?" component={Scheduling} />
                <Route path="/tablet" component={RangeOfficerView} />
                <Route path="/usermanagement" component={UserManagementView} />
                <Route path="/tracks" component={TrackCRUD} />
              </Switch>
            </header>
          </div>
        </Router>
      </CookiesProvider>
    );
  }
}

export default withCookies(App);
