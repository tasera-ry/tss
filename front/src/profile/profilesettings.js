import React from "react";

import PasswordChange from "./profilepages/changepassword";

import { Link } from "react-router-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { useCookies } from "react-cookie";

import texts from "../texts/texts.json";
import { List, ListItem } from "@material-ui/core";

import css from './profilesettings.module.scss';

import classNames from 'classnames';

const classes = classNames.bind(css);

const fin = localStorage.getItem("language");
const { profileSettings } = texts;

// Returns the profile component, which consists of sidebar and content.

function Profile() {
  const [cookies] = useCookies(["username"]);
  return (
    <Router>
      <div className={classes(css.ProfileStyle)}>
        <div className={classes(css.SidebarStyle)}>
          <List className={classes(css.listStyle)}>
            {/* When new profile features are added, change path*/}
            <Link className={classes(css.elementStyle)} to="/profile">
              <ListItem button>{profileSettings.navPassword[fin]}</ListItem>
            </Link>
          </List>
        </div>
        <div className={classes(css.ContentStyle)}>
          <Switch>
            <Route path="/">
              <PasswordChange username={cookies.username} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default Profile;
