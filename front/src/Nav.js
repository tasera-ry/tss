import React, { useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import logo from "./Logo.png";
import DialogWindow from './LoggedIn';
import axios from 'axios';

const SideMenu = ({setName, superuser}) => {
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
    storage.clear();
    setName("");
    HandleClose();
  }

  return (
    <div>

      {storage.getItem("taseraUserName")!==null ?
       <Button
         onClick={HandleClick}
         size="small">
         Valikko
       </Button>
       : ""
      }

      {superuser===true ? <SuperMenu anchorEl={anchorEl} HandleClose={HandleClose}
                              setOpenDial={setOpenDial} HandleSignOut={HandleSignOut}
                               HandleClick={HandleClick} navStyle={navStyle} />
    : <BasicMenu anchorEl={anchorEl} HandleClose={HandleClose}
                              setOpenDial={setOpenDial} HandleSignOut={HandleSignOut}
                               navStyle={navStyle}/>  }

      {openDial ? <DialogWindow /> : "" }

    </div>
  )
}

const BasicMenu = ({anchorEl, HandleClose, setOpenDial, HandleSignOut, navStyle}) => {
  return (
    <Menu
      id="menu"
      open={Boolean(anchorEl)}
      keepMounted
      anchorEl={anchorEl}
      onClose={HandleClose}>

      <MenuItem onClick={() => setOpenDial(true)}> Valvonnat </MenuItem>
      
      <Link style={navStyle} to="/tablet">
        <MenuItem> Tablettinäkymä </MenuItem>
      </Link>

      <Link style={navStyle} to="/">
        <MenuItem onClick={HandleSignOut}> Kirjaudu ulos </MenuItem>
      </Link>
    </Menu>
  )
}

const SuperMenu = ({anchorEl, HandleClose, setOpenDial, HandleSignOut, HandleClick, navStyle}) => {
  return (
    <Menu
      id="menu"
      open={Boolean(anchorEl)}
      keepMounted
      anchorEl={anchorEl}
      onClose={HandleClose}>
      
      <Link style={navStyle} to="/scheduling">
        <MenuItem onClick={HandleClick}> Aikataulut </MenuItem>
      </Link>

      <Link style={navStyle} to="/usermanagement">
        <MenuItem> Käyttäjienhallinta </MenuItem>
      </Link>

      <MenuItem onClick={() => setOpenDial(true)}> Valvonnat </MenuItem>

      <Link style={navStyle} to="/tablet">
        <MenuItem> Tablettinäkymä </MenuItem>
      </Link>

      <Link style={navStyle} to="/">
        <MenuItem onClick={HandleSignOut}> Kirjaudu ulos </MenuItem>
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
       <Link to="/signin">
         <Button
           size="small">
           Kirjaudu sisään
         </Button>
       </Link>
       :
       <p>{name}</p>
      }

      <SideMenu setName={setName} superuser={superuser} />
      
    </nav>
  )
}
export default Nav;
