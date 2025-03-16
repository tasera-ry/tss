import { useEffect } from 'react';

import './shared.module.scss';
import './App.css';

import { Route, HashRouter as Router, Switch } from 'react-router-dom';
import { EmailSettingsView } from './EmailSettings/EmailSettings';
import TrackCRUD from './edittracks/tracks';
import Dayview from './pages/DayView/DayView';
import { TabletView } from './pages/TabletView/TabletView';
import { Weekview } from './pages/WeekView/WeekView';
import Profile from './profile/profilesettings';
import Raffle from './raffle/raffle';
import RenewPassword from './renewPW/RenewPassword';
import ResetPassword from './resetPW/ResetPassword';
import Scheduling from './scheduling/Scheduling';
import SignIn from './signin/SignIn';
import { Trackview } from './trackview/Trackview';
import UserManagementView from './usermanagement/UserManagementView';

import { Navbar } from '@/lib/components/Navbar';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { InfoMessageManagementView } from '@/pages/InfoMessageManagementView';
import { Monthview } from '@/pages/MonthView/MonthView';
import { StatisticsView } from '@/pages/StatisticsView/StatisticsView';

export function App() {
  const { validateToken } = useLoggedInUser();

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  if (localStorage.getItem('language') === null) {
    localStorage.setItem('language', '0');
  }

  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Weekview} />
        <Route exact path="/signin" component={SignIn} />
        <Route path="/signin/reset-password" component={ResetPassword} />
        <Route path="/renew-password/:token?" component={RenewPassword} />
        <Route path="/dayview/:date?" component={Dayview} />
        <Route path="/weekview/:date?" component={Weekview} />
        <Route path="/monthview/:date?" component={Monthview} />
        <Route path="/trackview/:date?/:track?" component={Trackview} />
        <Route path="/scheduling/:date?" component={Scheduling} />
        <Route path="/tablet" component={TabletView} />
        <Route path="/profile" component={Profile} />
        <Route path="/usermanagement" component={UserManagementView} />
        <Route path="/supervisor-raffle" component={Raffle} />
        <Route path="/tracks" component={TrackCRUD} />
        <Route path="/email-settings" component={EmailSettingsView} />
        <Route path="/statistics/:date?" component={StatisticsView} />
        <Route path="/info" component={InfoMessageManagementView} />
      </Switch>
    </Router>
  );
}
