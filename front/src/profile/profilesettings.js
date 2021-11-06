import React from 'react';
import classNames from 'classnames';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { List, ListItem } from '@material-ui/core';
import translations from '../texts/texts.json';
import ChangePassword from './profilepages/changepassword';
import css from './ProfileSettings.module.scss';

const classes = classNames.bind(css);

const fin = localStorage.getItem('language');
const { profileSettings } = translations;

// Profile component consists of sidebar and content
const Profile = () => {
  const [cookies] = useCookies(['username']);
  return (
    <Router>
      <div className={classes(css.profile)}>
        <div className={classes(css.sidebar)}>
          <List className={classes(css.list)}>
            {/* When new profile features are added, change path */}
            <Link className={classes(css.link)} to="/profile">
              <ListItem button>{profileSettings.navPassword[fin]}</ListItem>
            </Link>
          </List>
        </div>
        <div className={classes(css.content)}>
          <Switch>
            <Route path="/">
              <ChangePassword username={cookies.username} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default Profile;
