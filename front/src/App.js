import React, { useState, useEffect } from 'react';

// Style and colors
import './shared.module.scss';

import axios from 'axios';

// Custom components
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { CookiesProvider, withCookies } from 'react-cookie';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SignIn from './signin/SignIn';
import ResetPassword from './resetPW/ResetPassword';
import RenewPassword from './renewPW/RenewPassword';
import Nav from './navbar/Nav';
import AddInfo from './infoBox/AddInfo';
import Dayview from './dayview/Dayview';
import Weekview from './weekview/Weekview';
import Trackview from './trackview/Trackview';
import Scheduling from './scheduling/Scheduling';
import RangeOfficerView from './tabletview/rangeofficer';
import Profile from './profile/profilesettings';
import UserManagementView from './usermanagement/UserManagementView';
import TrackCRUD from './edittracks/tracks';
import Monthview from './monthview/Monthview';
import Statistics from './statistics/Statistics';
import EmailSettings from './EmailSettings/EmailSettings';
import Raffle from './raffle/raffle';

// React router. Hashrouter, because normal router won't work in apache

import { validateLogin } from './utils/Utils';

// TO DO: Move this to scss if possible.

const theme = createTheme({
  palette: {
    primary: {
      main: '#4D4D4D',
    },
  },
});

/*
   The main component of the whole project.
*/
const App = (props) => {

  const [cookies, setCookies] = useState(props.allCookies);

  // TODO: this works, but flashes if invalid
  useEffect(() => {
    if(cookies.username){
      validateLogin().then(async (tokenValid) => {
        if(!tokenValid){
          const response = await axios.post('/api/signout'); // eslint-disable-line
          props.cookies.remove('username');
          props.cookies.remove('role');

          window.location.reload();
        }
      });
    }
  }, []);

  if (localStorage.getItem('language') === null) {
    localStorage.setItem('language', 0);
  }
  
  return (
    <CookiesProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <div className="App">
            <header className="App-header">
              <Nav />
              <Switch>
                <Route exact path="/" component={Weekview} />
                <Route exact path="/signin" component={SignIn} />
                <Route
                  path="/signin/reset-password"
                  component={ResetPassword}
                />
                <Route
                  path="/renew-password/:token?"
                  component={RenewPassword}
                />
                <Route path="/dayview/:date?" component={Dayview} />
                <Route path="/weekview" component={Weekview} />
                <Route path="/monthview" component={Monthview} />
                <Route
                  path="/trackview/:date?/:track?"
                  component={Trackview}
                />
                <Route path="/scheduling/:date?" component={Scheduling} />
                <Route path="/tablet" component={RangeOfficerView} />
                <Route path="/profile" component={Profile} />
                <Route
                  path="/usermanagement"
                  component={UserManagementView}
                />
                <Route path="/supervisor-raffle" component={Raffle} />
                <Route path="/tracks" component={TrackCRUD} />
                <Route path="/email-settings" component={EmailSettings} />
                <Route path="/statistics" component={Statistics} />
                <Route path="/info" component={AddInfo} />
              </Switch>
            </header>
          </div>
        </ThemeProvider>
      </Router>
    </CookiesProvider>
  );
}

export default withCookies(App);
