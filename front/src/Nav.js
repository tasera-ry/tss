import React, { useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import logo from "./Logo.png";
import DialogWindow from './LoggedIn';
import axios from 'axios';

//TODO:
//linkki käyttäjienhallintaan
//kirjaudu ulos johtaa uloskirjautumiseen
//autentikaatiotason selvitys jotta tiedetään mitkä menuitemit esiin,
//nyt tsekataan vain onko kirjautuessa talletettu nimeä

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
    
    //tätä ei kai taideta käyttää edes
    sessionStorage.clear();
    
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

      {superuser ? <SuperMenu anchorEl={anchorEl} HandleClose={HandleClose}
                              setOpenDial={setOpenDial} HandleSignOut={HandleSignOut}
                               HandleClick={HandleClick} navStyle={navStyle} />
    : <BasicMenu anchorEl={anchorEl} HandleClose={HandleClose}
                              setOpenDial={setOpenDial} HandleSignOut={HandleSignOut}
                              HandleClick={HandleClick} navStyle={navStyle}/>  }

      {openDial ? <DialogWindow /> : <p></p> }

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

      <Link style={navStyle}>
        <MenuItem
          onClick={() => setOpenDial(true)}>
          Valvonnat
        </MenuItem>
      </Link>

      <Link style={navStyle} to="/tablet">
        <MenuItem>
          Tablettinäkymä
        </MenuItem>
      </Link>

      <Link style={navStyle} to="/">
        <MenuItem
          onClick={HandleSignOut}>
          Kirjaudu ulos
        </MenuItem>
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
        <MenuItem
          onClick={HandleClick}>
          Aikataulut
        </MenuItem>
      </Link>

      <Link style={navStyle} to="/usermanagement">
        <MenuItem>
          Käyttäjienhallinta
        </MenuItem>
      </Link>

      <Link style={navStyle}>
        <MenuItem
          onClick={() => setOpenDial(true)}>
          Valvonnat
        </MenuItem>
      </Link>

      <Link style={navStyle} to="/tablet">
        <MenuItem>
          Tablettinäkymä
        </MenuItem>
      </Link>

      <Link style={navStyle} to="/">
        <MenuItem
          onClick={HandleSignOut}>
          Kirjaudu ulos
        </MenuItem>
      </Link>
    </Menu>
  )
}

const UserInfo = ({name, setName}) => {
  let username = localStorage.getItem("taseraUserName")
  if(username!==null) {
    setName(username)
  }
  console.log("username: ", name)

  return (
    <div>
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
      
    </div>
  )

}

async function isSuperuser() {
  let token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  let query = "/api/user?name=" + localStorage.getItem("taseraUserName");
  let response = await axios.get(query, config);
  let role = response.data[0].role;
  console.log("logged in as", role);
  return role==="superuser";
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
  let superuser = null;
  if(name!=="") {
    superuser = isSuperuser();
  }
  var icon = (
    <span class="logo">
      <a href="/">
        <img style={logoStyle} src={logo} alt="Tasera" />
      </a>
    </span>
  );

  return (
    <nav>
      <Link style={logoStyle} to="/">
        {icon}
      </Link>
      
      <UserInfo name={name} setName={setName} />

      <SideMenu setName={setName} superuser={superuser} />
      
    </nav>
  )
}

export default Nav;
