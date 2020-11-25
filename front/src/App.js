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
import TrackCRUD from './edittracks/tracks';

// React router. Hashrouter, because normal router won't work in apache

import { validateLogin } from './utils/Utils';

/*
   The main component of the whole project.
*/
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      username: null,
      role: null
    };

    this.updateLoginInfo = this.updateLoginInfo.bind(this);
    this.updateRole = this.updateRole.bind(this);
  }

  updateLoginInfo(taseraUserName, token) {
    this.setState({
      taseraUserName,
      token
    })
  }

  updateRole(role) {
    this.setState({
      role
    })
  }

  componentDidMount() {
    if (this.state.token !== null) {
      validateLogin(this.state.token)
        .then((tokenValid) => {
          // If the token is expired, logout user
          if (!tokenValid) {
            localStorage.removeItem('token');
            localStorage.removeItem('taseraUserName');
            localStorage.removeItem('role');

            this.updateLoginInfo(null, null);
            this.updateRole(null);

            window.location.reload();
          }
        });
    }
  }

  render() {
    if (localStorage.getItem('language') === null) {
      localStorage.setItem('language', 0);
    }
    const loginInfo = {
      token: this.state.token,
      username: this.state.username,
      role: this.state.role,
      updateLoginInfo: this.updateLoginInfo,
      updateRole: this.updateRole
    }
    return (
      <LoginContext.Provider value={loginInfo}>
        <Router>
          <div className="App">
            <header className="App-header">
              <Nav loginInfo={loginInfo}/>
              <Switch>
                <Route path="/" exact component={Weekview} />
                <Route path="/signin" render={() => <SignIn loginInfo={loginInfo} />} />
                <Route path="/dayview/:date?" component={Dayview} />
                <Route path="/weekview" component={Weekview} />
                <Route path="/trackview/:date?/:track?" component={Trackview} />
                <Route path="/scheduling/:date?" render={() => <Scheduling loginInfo={loginInfo} />} />
                <Route path="/tablet" component={RangeOfficerView} />
                <Route path="/usermanagement" render={() => <UserManagementView loginInfo={loginInfo} />} />
                <Route path="/tracks" render={() => <TrackCRUD loginInfo={loginInfo} />} />
              </Switch>
            </header>
          </div>
        </Router>
      </LoginContext.Provider>
    );
  }
}

export default App;
