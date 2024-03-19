import React from 'react';
import classNames from 'classnames';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { List, ListItem } from '@material-ui/core';
import translations from '../texts/texts.json';
import ChangePassword from './profilepages/changepassword';
import RangeOfficers from './profilepages/rangeofficers';
import css from './ProfileSettings.module.scss';

const classes = classNames.bind(css);

const fin = localStorage.getItem('language');
const { profileSettings } = translations;

const Profile = () => {
  const [cookies] = useCookies(['username']);

  // If user is not logged in, redirect to homepage
  if (!cookies.role) {
    window.location.href = '/';
  }

  const renderSidebar = () => (
    <div className={classes(css.sidebar)}>
      <List className={classes(css.list)}>
        <Link className={classes(css.link)} to="/profile/changepassword">
          <ListItem button>{profileSettings.navPassword[fin]}</ListItem>
        </Link>
        <Link className={classes(css.link)} to="/profile/rangeofficers">
          <ListItem button>{profileSettings.navRangeofficers[fin]}</ListItem>
        </Link>
      </List>
    </div>
  );

  return (
    <Router>
      <div className={classes(css.profile)}>
        {renderSidebar()}
        <div className={classes(css.content)}>
          <Switch>
            <Route path="/profile/changepassword">
              <ChangePassword username={cookies.username} id={cookies.id} />
            </Route>
            <Route path="/profile/rangeofficers">
              <RangeOfficers id={cookies.id} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default Profile;
