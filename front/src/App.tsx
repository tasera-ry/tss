import { useEffect } from 'react';

import './shared.module.scss';
import './App.css';

import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import SignIn from './signin/SignIn';
import ResetPassword from './resetPW/ResetPassword';
import RenewPassword from './renewPW/RenewPassword';
import AddInfo from './infoBox/AddInfo';
import Dayview from './dayview/Dayview';
import { Weekview } from './weekview/Weekview';
import { Trackview } from './trackview/Trackview';
import Scheduling from './scheduling/Scheduling';
import { TabletView } from './pages/TabletView/TabletView';
import Profile from './profile/profilesettings';
import UserManagementView from './usermanagement/UserManagementView';
import TrackCRUD from './edittracks/tracks';
import Statistics from './statistics/Statistics';
import EmailSettings from './EmailSettings/EmailSettings';
import Raffle from './raffle/raffle';

import { Navbar } from '@/lib/components/Navbar';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { Monthview } from '@/monthview/Monthview';


export function App() {

  const { validateToken } = useLoggedInUser();

  useEffect(() => {
    validateToken()
  }, []);

  if (localStorage.getItem('language') === null) {
    localStorage.setItem('language', "0");
  }
  
  return (
    <Router>
      <Navbar />
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
        <Route path="/weekview/:date?" component={Weekview} />
        <Route path="/monthview/:date?" component={Monthview} />
        <Route
          path="/trackview/:date?/:track?"
          component={Trackview}
        />
        <Route path="/scheduling/:date?" component={Scheduling} />
        <Route path="/tablet" component={TabletView} />
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
    </Router>
  );
}
