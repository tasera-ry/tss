import React, { Component, useState } from 'react';

import './App.css';

// Custom components
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import SignIn from './signin/SignIn';
import Nav from './navbar/Nav';
import Dayview from './dayview/Dayview';
import Weekview from './weekview/Weekview';
import Trackview from './trackview/Trackview';
import Scheduling from './scheduling/Scheduling';
import RangeOfficerView from './tabletview/rangeofficer';
import UserManagementView from './usermanagement/UserManagementView';
import LoginContext from './LoginContext';
import trackCRUD from './edittracks/tracks';

// React router. Hashrouter, because normal router won't work in apache

import { validateLogin } from './utils/Utils';

/*
   The main component of the whole project.
*/
class App extends Component {
  constructor(props) {
    super(props);
    this.loginState = {something: "some text"};
  }

  setLoginState(loginState) {
    this.loginState = loginState;
  }

  componentDidMount() {
    if (localStorage.getItem('token') !== null) {
      validateLogin()
        .then((tokenValid) => {
          // If the token is expired, logout user
          if (!tokenValid) {
            localStorage.removeItem('token');
            localStorage.removeItem('taseraUserName');
            localStorage.removeItem('role');

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
      <LoginContext.Provider value={{loginState: this.loginState, setLoginState: this.setLoginState}}>
        <Router>
          <div className="App">
            <header className="App-header">
              <Nav />
              <Switch>
                <Route path="/" exact component={Weekview} />
                <Route path="/signin" component={SignIn} />
                <Route path="/dayview/:date?" component={Dayview} />
                <Route path="/weekview" component={Weekview} />
                <Route path="/trackview/:date?/:track?" component={Trackview} />
                <Route path="/scheduling/:date?" component={Scheduling} />
                <Route path="/tablet" component={RangeOfficerView} />
                <Route path="/usermanagement" component={UserManagementView} />
                <Route path="/tracks" component={trackCRUD} />
              </Switch>
            </header>
          </div>
        </Router>
      </LoginContext.Provider>
    );
  }
}

export default App;
