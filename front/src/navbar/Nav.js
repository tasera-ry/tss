import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import { useCookies } from 'react-cookie';

// Material UI elements
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import logo from '../logo/Logo.png';
import SupervisorNotification from './SupervisorNotification';
import FeedbackWindow from './FeedbackWindow';
import { DialogWindow } from '../upcomingsupervisions/LoggedIn';
import translations from '../texts/texts.json';
// enables overriding material-ui component styles in scss
import { StylesProvider } from '@material-ui/core/styles';
import css from './Nav.module.scss';

const classes = classNames.bind(css);

const { nav } = translations;

const SideMenu = ({ setName, superuser, setLoggingOut }) => {
  const lang = localStorage.getItem('language');
  const [open, setOpen] = useState({
    drawer: false,
    dialog: false,
    feedback: false,
  });
  const [cookies, setCookie, removeCookie] = useCookies(['username', 'role']); // eslint-disable-line

  // TODO: centralize this one
  const HandleSignOut = async () => {
    setLoggingOut(true);
    await api.signOut();
    removeCookie('username');
    removeCookie('role');
    setName(undefined);
    setOpen({ ...open, drawer: false });
  };

  const toggleDrawer = (drawerOpen) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    )
      return;
    setOpen({ ...open, drawer: drawerOpen, dialog: false });
  };

  const superuserList = [
    { to: '/scheduling', name: nav.Schedule[lang] },
    { to: '/usermanagement', name: nav.UserManagement[lang] },
    { to: '/tracks', name: nav.trackCRUD[lang] },
    { to: '/tablet', name: nav.Tablet[lang] },
    { to: '/email-settings', name: nav.EmailSettings[lang] },
    { to: '/statistics', name: nav.Statistics[lang] },
    { to: '/supervisor-raffle', name: nav.Raffle[lang]}
  ];
  const supervisorList = [
    { to: '/tablet', name: nav.Tablet[lang] },
    { to: '/profile', name: nav.Profile[lang] },
  ];

  const navList = (list) => (
    <>
      {list.map(({ to, name }) => (
        <Link to={to} key={name}>
          <ListItem button onClick={() => setOpen({ ...open, drawer: false })}>
            {name}
          </ListItem>
        </Link>
      ))}
    </>
  );

  return (
    <div className={classes(css.pc)}>
      {cookies.hasOwnProperty('username') && (
        <Button className={classes(css.clickable)} onClick={toggleDrawer(true)}>
          {nav.Menu[lang]}
        </Button>
      )}
      <Drawer
        anchor="right"
        open={open.drawer}
        onClose={toggleDrawer(false)}
        classes={{ paper: classes(css.paper) }}
      >
        <List className={classes(css.navList)}>
          {!superuser && (
            <ListItem
              button
              onClick={() => setOpen({ ...open, drawer: false, dialog: true })}
            >
              {nav.Supervision[lang]}
            </ListItem>
          )}
          {superuser ? navList(superuserList) : navList(supervisorList)}
          {!superuser && (
            <ListItem
              button
              onClick={() =>
                setOpen({ ...open, drawer: false, feedback: true })
              }
            >
              {nav.Feedback[lang]}
            </ListItem>
          )}
          <Divider />
          <Link to="/">
            <ListItem button onClick={HandleSignOut}>
              {nav.SignOut[lang]}
            </ListItem>
          </Link>
        </List>
      </Drawer>
      {open.dialog && <DialogWindow />}
      {open.feedback && (
        <FeedbackWindow
          user={cookies.username}
          dialogOpen={open.feedback}
          onCloseDialog={() => setOpen({ ...open, feedback: false })}
        />
      )}
    </div>
  );
};

const Nav = () => {
  const [cookies] = useCookies(['username', 'role']);
  const [name, setName] = useState(cookies.username);
  const [superuser] = useState(cookies.role === 'superuser');
  const [loggingOut, setLoggingOut] = useState(false);
  const [checkSupervisions, setCheckSupervisions] = useState(false);
  const lang = localStorage.getItem('language');
  const { nav } = translations;

  const langButtons = [
    { name: 'EN', num: 1 },
    { name: 'FIN', num: 0 },
  ];

  return (
    <StylesProvider injectFirst>
      <nav>
        <Link
          className={classes(css.logo)}
          to="/"
          onClick={() => setCheckSupervisions(true)}
        >
          <span>
            <img className={classes(css.logo)} src={logo} alt="Tasera" />
          </span>
        </Link>
        {name ? (
          <p className={classes(css.pc, css.text)}>{name}</p>
        ) : (
          <Link
            className={classes(css.loginLink, css.pc, css.clickable)}
            to="/signin"
          >
            <Button>{nav.SignIn[lang]}</Button>
          </Link>
        )}
        <div className={classes(css.langButtons, css.pc)}>
          {langButtons.map(({ name, num }) => (
            <Button
              className={classes(css.clickable)}
              onClick={() => {
                localStorage.setItem('language', num);
                window.location.reload();
              }}
              key={name}
            >
              {name}
            </Button>
          ))}
        </div>
        <SideMenu
          setName={setName}
          superuser={superuser}
          setLoggingOut={setLoggingOut}
        />
      </nav>
      <SupervisorNotification
        username={name}
        loggingOut={loggingOut}
        setLoggingOut={setLoggingOut}
        checkSupervisions={checkSupervisions}
        setCheckSupervisions={setCheckSupervisions}
      />
    </StylesProvider>
  );
};
export default Nav;
