import React, { useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import logo from "./Logo.png";
import DialogWindow from './LoggedIn';
import axios from 'axios';
import * as data from './texts/texts.json';

const SideMenu = ({setName, superuser, nav, fin}) => {
  const navStyle = {
    color: "black",
    textDecoration: "none"
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDial, setOpenDial] = useState(false);
  let storage = window.localStorage;

  const HandleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenDial(false);
  };

  const HandleClose = (event) => {
    setAnchorEl(null);
  }

  const HandleSignOut = () => {
    storage.removeItem("token");
    storage.removeItem("taseraUserName");
    storage.removeItem("role");
    setName("");
    HandleClose();
  }

  return (
    <div>

      {storage.getItem("taseraUserName")!==null ?
       <Button
         onClick={HandleClick}
         size="small">
         {nav.Menu[fin]}
       </Button>
       : ""
      }

      {superuser===true ?
       <SuperMenu anchorEl={anchorEl} HandleClose={HandleClose}
                  setOpenDial={setOpenDial} HandleSignOut={HandleSignOut}
                  HandleClick={HandleClick} navStyle={navStyle} nav={nav} fin={fin} />
       : <BasicMenu anchorEl={anchorEl} HandleClose={HandleClose}
                    setOpenDial={setOpenDial} HandleSignOut={HandleSignOut}
                    navStyle={navStyle} nav={nav} fin={fin} /> }

      {openDial ? <DialogWindow /> : "" }

    </div>
  )
}

const BasicMenu = ({anchorEl, HandleClose, setOpenDial, HandleSignOut, navStyle, nav, fin}) => {
  return (
    <Menu
      id="menu"
      open={Boolean(anchorEl)}
      keepMounted
      anchorEl={anchorEl}
      onClose={HandleClose}>

      <MenuItem onClick={() => setOpenDial(true)}> {nav.Supervision[fin]} </MenuItem>

      <Link style={navStyle} to="/tablet">
        <MenuItem> {nav.Tablet[fin]} </MenuItem>
      </Link>

      <Link style={navStyle} to="/">
        <MenuItem onClick={HandleSignOut}> {nav.SignOut[fin]} </MenuItem>
      </Link>
    </Menu>
  )
}

const SuperMenu = ({anchorEl, HandleClose, setOpenDial, HandleSignOut,
                    HandleClick, navStyle, nav, fin}) => {
  return (
    <Menu
      id="menu"
      open={Boolean(anchorEl)}
      keepMounted
      anchorEl={anchorEl}
      onClose={HandleClose}>

      <Link style={navStyle} to="/scheduling">
        <MenuItem onClick={HandleClick}> {nav.Schedule[fin]} </MenuItem>
      </Link>

      <Link style={navStyle} to="/usermanagement">
        <MenuItem> {nav.UserManagement[fin]} </MenuItem>
      </Link>

      <Link style={navStyle} to="/tracks">
        <MenuItem>{nav.trackCRUD[fin]}</MenuItem>
      </Link>



      <Link style={navStyle} to="/tablet">
        <MenuItem> {nav.Tablet[fin]} </MenuItem>
      </Link>

      <Link style={navStyle} to="/">
        <MenuItem onClick={HandleSignOut}> {nav.SignOut[fin]} </MenuItem>
      </Link>
    </Menu>
  )
}

function userInfo(name, setName, setSuperuser) {
  let username = localStorage.getItem("taseraUserName")
  if(username!==null) {
    setName(username)
    let role = localStorage.getItem("role")
    setSuperuser(role==="superuser")
  }
}

function setLanguage(num) {
  localStorage.setItem("language", num);
  window.location.reload();
}

const Nav = () => {
  const navStyle = {
    color: "black",
    textDecoration: "none"
  };
  const logoStyle = {
    textDecoration: "none",
    height: "100%",
    width: "60%",
    display: "block"
  };

  const [name, setName] = useState("");
  const [superuser, setSuperuser] = useState();
  const fin = localStorage.getItem("language"); //0: finnish, 1: english
  const {nav} = data;

  if(name==="") {
    userInfo(name, setName, setSuperuser);
  }

  console.log("username: ", name)
  console.log("is superuser", superuser)

  const icon = (
    <span className="logo">
        <img style={logoStyle} src={logo} alt="Tasera" />
    </span>
  );

  return (
    <nav>
      <Link style={logoStyle} to="/">
        {icon}
      </Link>

      {name==="" ?
       <Link style={{textDecoration:'none'}} to="/signin">
         <Button
           size="small">
           {nav.SignIn[fin]}
         </Button>
       </Link>
       :
       <p>{name}</p>
      }

      <span>
        <Button onClick={()=> setLanguage(1)}>EN</Button>
        <Button onClick={()=> setLanguage(0)}>FI</Button>
      </span>

      <SideMenu setName={setName} superuser={superuser} nav={nav} fin={fin} />

    </nav>
  )
}
export default Nav;
