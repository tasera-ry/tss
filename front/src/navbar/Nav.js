import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../api/api';
import { useCookies } from 'react-cookie';

// Material UI elements
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import logo from '../logo/Logo.png';
import SupervisorNotification from './SupervisorNotification';
import FeedbackWindow from './FeedbackWindow';
import translations from '../texts/texts.json';
// enables overriding material-ui component styles in scss
import { StyledEngineProvider } from '@mui/material/styles';
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
  const [cookies, setCookie, removeCookie] = useCookies([
    'username',
    'role',
    'id',
  ]); // eslint-disable-line

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
    { to: '/supervisor-raffle', name: nav.Raffle[lang] },
    { to: '/info', name: nav.Info[lang] },    

  
  ];

  const associationList = [
    { to: '/profile', name: nav.AssociationProfile[lang] },
  ];

  const rangeofficerList = [
    { to: '/profile', name: nav.RangeofficerProfile[lang] },
  ];

  const rangeMasterList = [{ to: '/tablet', name: nav.Tablet[lang] }];

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
            <Link to="/profile/supervisions">
              <ListItem
                button
                onClick={() => setOpen({ ...open, drawer: false })}
              >
                {nav.Supervision[lang]}
              </ListItem>
            </Link>
          )}
          {superuser && navList(superuserList)}
          {cookies.role === 'association' && navList(associationList)}
          {cookies.role === 'rangeofficer' && navList(rangeofficerList)}
          {cookies.role === 'rangemaster' && navList(rangeMasterList)}
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
    { name: 'SWE', num: 2 },
    { name: 'ENG', num: 1 },
    { name: 'FIN', num: 0 },
  ];

  return (
    <StyledEngineProvider injectFirst>
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
            <Button className={classes(css.loginbutton)}>
              {nav.SignIn[lang]}
            </Button>
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
    </StyledEngineProvider>
  );
};
export default Nav;
