import React, { useState } from "react";

import "../App.css";
import './Nav.css';

// TASERA logo & Burger icon
import logo from "../logo/Logo.png";
import Burger from "../logo/Burger.png";

// Material UI elements
import { Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';



// Upcoming supervisions -view
import DialogWindow from '../upcomingsupervisions/LoggedIn';

// Translations
import * as data from '../texts/texts.json';
const fin = localStorage.getItem("language"); //0: finnish, 1: english
const {nav} = data;

//Styles
const useStyles = makeStyles({
  paper: {
    background: '#f2f0eb'
  }
});
const navStyle = {
  color: "black",
  textDecoration: "none"
}
const drawerStyle = {
  fontSize:17,
  padding:10,
  marginTop:10,
  width:200
}
const elementStyle = {
  marginTop:10
}

const SideMenu = ({setName, superuser}) => {
  const styles = useStyles();
  const [menu, setMenu] = useState({"right": false})
  const [openDial, setOpenDial] = useState(false)
  let storage = window.localStorage;

  const HandleClick = () => {
    setMenu({"right": false})
  }

  const HandleOpenDialog = () => {
    setMenu({"right": false})
    setOpenDial(true)
  }

  const HandleSignOut = () => {
    storage.removeItem("token");
    storage.removeItem("taseraUserName");
    storage.removeItem("role");
    setName("");
    setMenu({"right": false});
  }

  const toggleDrawer = (anchor, open) => (event) => {
    setOpenDial(false)
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMenu({"right": open })
  }

  const superuserList = () => (
    <div style={drawerStyle}>
      <List>
        <Link style={navStyle} to="/scheduling">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}>
            {nav.Schedule[fin]}
          </ListItem>
        </Link>

        <Link style={navStyle} to="/usermanagement">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}>
            {nav.UserManagement[fin]}
          </ListItem>
        </Link>

        <Link style={navStyle} to="/tracks">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}>
            {nav.trackCRUD[fin]}
          </ListItem>
        </Link>

        <Link style={navStyle} to="/tablet">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}>
            {nav.Tablet[fin]}
          </ListItem>
        </Link>

        <Divider style={elementStyle} />

        <Link style={navStyle} to="/">
          <ListItem
            button
            onClick={HandleSignOut}
            style={elementStyle}>
            {nav.SignOut[fin]}
          </ListItem>
        </Link>
      </List>
    </div>
  )

  const supervisorList = () => (
    <div style={drawerStyle}>
      <List>
        <ListItem
          button
          onClick={HandleOpenDialog}
          style={elementStyle}>
          {nav.Supervision[fin]}
        </ListItem>

        <Link style={navStyle} to="/tablet">
          <ListItem
            button
            onClick={HandleClick}
            style={elementStyle}>
            {nav.Tablet[fin]}
          </ListItem>
        </Link>

        <Divider style={elementStyle} />

        <Link style={navStyle} to="/">
          <ListItem
            button
            onClick={HandleSignOut}
            style={elementStyle}>
            {nav.SignOut[fin]}
          </ListItem>
        </Link>
      </List>
    </div>
  )

  return (
    <div className="pc">
      {storage.getItem("taseraUserName")!==null ?
       <Button className="clickable"
         onClick={toggleDrawer("right", true)}>
         {nav.Menu[fin]}
       </Button>
       : ""}

      <div>
      <Drawer
        anchor={"right"}
        open={menu.right}
        onClose={toggleDrawer("right", false)}
        classes={{ paper: styles.paper }}>
        {superuser?
         superuserList("left")
         : supervisorList("left")}
      </Drawer>

    </div>
      {openDial ? <DialogWindow /> : "" }
      
    </div>

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
  const [name, setName] = useState("");
  const [superuser, setSuperuser] = useState();

  if(name==="") {
    userInfo(name, setName, setSuperuser);
  }

  //console.log("username: ", name)
  //console.log("is superuser", superuser)

  const icon = (
    <span className="logo">
        <img className="logoStyle" src={logo} alt="Tasera" />
    </span>
  );

  return (
    <nav>
      <Link className="logoStyle" to={"/"}>
        {icon}
      </Link>

      {name==="" ?
       <Link className="pc clickable" style={{textDecoration:'none'}} to="/signin">
         <Button>
           {nav.SignIn[fin]}
         </Button>
       </Link>
       :
       <p className="pc">{name}</p>
      }


      <span className="pc clickable">
        <Button onClick={()=> setLanguage(1)}>EN</Button>
        <Button onClick={()=> setLanguage(0)}>FI</Button>
      </span>

      <SideMenu setName={setName} superuser={superuser} />

    </nav>
  )

}
export default Nav;
