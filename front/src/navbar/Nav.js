import React, { useState } from 'react';

import '../App.css';
import './Nav.css';

// TASERA logo & Burger icon

// Material UI elements
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles } from '@material-ui/core/styles';
import logo from '../logo/Logo.png';

import SupervisorNotification from './SupervisorNotification'; // eslint-disable-line

import { DialogWindow } from '../upcomingsupervisions/LoggedIn';

// Translations
import texts from '../texts/texts.json';

// 0: finnish, 1: english
const fin = localStorage.getItem('language'); // eslint-disable-line
const { nav } = texts;

// Styles
const useStyles = makeStyles({
  paper: {
    background: '#f2f0eb',
  },
});
const navStyle = {
  color: 'black',
  textDecoration: 'none',
};
const drawerStyle = {
  fontSize: 17,
  padding: 10,
  marginTop: 10,
  width: 200,
};
const elementStyle = {
  marginTop: 10,
};

const SideMenu = ({ setName, superuser, setLoggingOut }) => {
  const fin = localStorage.getItem('language'); // eslint-disable-line
  const styles = useStyles();
  const [menu, setMenu] = useState({ right: false });
  const [openDial, setOpenDial] = useState(false);
  const storage = window.localStorage;

  const HandleClick = () => {
    setMenu({ right: false });
  };

  const HandleOpenDialog = () => {
    setMenu({ right: false });
    setOpenDial(true);
  };

  const HandleSignOut = () => {
    setLoggingOut(true);
    storage.removeItem('token');
    storage.removeItem('taseraUserName');
    storage.removeItem('role');
    setName('');
    setMenu({ right: false });
  };

  const toggleDrawer = (anchor, open) => (event) => {
    setOpenDial(false);
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMenu({ right: open });
  };

  const superuserList = () => (
    <div style={drawerStyle}>
      <List>
        <Link style={navStyle} to="/scheduling">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}
          >
            {nav.Schedule[fin]}
          </ListItem>
        </Link>

        <Link style={navStyle} to="/usermanagement">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}
          >
            {nav.UserManagement[fin]}
          </ListItem>
        </Link>

        <Link style={navStyle} to="/tracks">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}
          >
            {nav.trackCRUD[fin]}
          </ListItem>
        </Link>

        <Link style={navStyle} to="/tablet">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}
          >
            {nav.Tablet[fin]}
          </ListItem>
        </Link>

        <Divider style={elementStyle} />

        <Link style={navStyle} to="/">
          <ListItem
            button
            onClick={HandleSignOut}
            style={elementStyle}
          >
            {nav.SignOut[fin]}
          </ListItem>
        </Link>
      </List>
    </div>
  );

  const supervisorList = () => (
    <div style={drawerStyle}>
      <List>
        <ListItem
          button
          onClick={HandleOpenDialog}
          style={elementStyle}
        >
          {nav.Supervision[fin]}
        </ListItem>

        <Link style={navStyle} to="/tablet">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}
          >
            {nav.Tablet[fin]}
          </ListItem>
        </Link>

        <Divider style={elementStyle} />

        <Link style={navStyle} to="/">
          <ListItem
            button
            onClick={HandleSignOut}
            style={elementStyle}
          >
            {nav.SignOut[fin]}
          </ListItem>
        </Link>
      </List>
    </div>
  );

  return (
    <div className="pc">
      {storage.getItem('taseraUserName') !== null
        ? (
          <Button
            className="clickable"
            onClick={toggleDrawer('right', true)}
          >
            {nav.Menu[fin]}
          </Button>
        )
        : ''}

      <div>
        <Drawer
          anchor="right"
          open={menu.right}
          onClose={toggleDrawer('right', false)}
          classes={{ paper: styles.paper }}
        >
          {superuser
            ? superuserList('left')
            : supervisorList('left')}
        </Drawer>

      </div>
      {openDial ? <DialogWindow /> : '' }
    </div>
  );
};

function userInfo(name, setName, setSuperuser) {
  const username = localStorage.getItem('taseraUserName');
  if (username !== null) {
    setName(username);
    const role = localStorage.getItem('role');
    setSuperuser(role === 'superuser');
  }
}

function setLanguage(num) {
  localStorage.setItem('language', num);
  window.location.reload();
}

const Nav = () => {
  const [name, setName] = useState('');
  const [superuser, setSuperuser] = useState();
  const [loggingOut, setLoggingOut] = useState(false);
  const [checkSupervisions, setCheckSupervisions] = useState(false);
  const fin = localStorage.getItem('language'); // eslint-disable-line
  const { nav } = texts; // eslint-disable-line

  if (name === '') {
    userInfo(name, setName, setSuperuser);
  }

  const icon = (
    <span className="logo">
      <img className="logoStyle" src={logo} alt="Tasera" />
    </span>
  );

  return (
    <div>
      <nav>
        <Link className="logoStyle" to="/" onClick={() => setCheckSupervisions(true)}>
          {icon}
        </Link>

        {name === '' ? (
          <Link className="pc clickable" style={{ textDecoration: 'none' }} to="/signin">
            <Button>
              {nav.SignIn[fin]}
            </Button>
          </Link>
        )
          : <p className="pc">{name}</p>}

        <span className="pc">
          <Button className="clickable" onClick={() => setLanguage(1)}>EN</Button>
          <Button className="clickable" onClick={() => setLanguage(0)}>FI</Button>
        </span>

        <SideMenu
          setName={setName}
          superuser={superuser}
          setLoggingOut={setLoggingOut}
        />

      </nav>
      <SupervisorNotification
        loggingOut={loggingOut}
        setLoggingOut={setLoggingOut}
        checkSupervisions={checkSupervisions}
        setCheckSupervisions={setCheckSupervisions}
      />
    </div>
  );
};
export default Nav;
