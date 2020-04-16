import React, { useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import logo from "./Logo.png";
import DialogWindow from './LoggedIn';

//TODO:
//linkki käyttäjienhallintaan
//kirjaudu ulos johtaa uloskirjautumiseen
//autentikaatiotason selvitys jotta tiedetään mitkä menuitemit esiin

const SideMenu = ({setName}) => {
  const navStyle = {
    color: "black",
    textDecoration: "none"
  };
  
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDial, setOpenDial] = useState(false);

    const HandleClick = (event) => {
      setAnchorEl(event.currentTarget);
      setOpenDial(false);
    };

    const HandleClose = (event) => {
      setAnchorEl(null);
    }

    const HandleSignOut = () => {
      sessionStorage.clear();
      setName(null);
      HandleClose();

    }

    return (
      <div>     
        <Button
          onClick={HandleClick}
          size="small">
          Valikko
        </Button>

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

        {openDial ? <DialogWindow /> : <p></p> }

      </div>
    )
  }

const UserInfo = ({name, setName}) => {
  setName(sessionStorage.getItem("taseraUserName"))
  console.log(name)

  return (
    <div>
      {name===null ?
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

  const [name, setName] = useState();

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

      <SideMenu setName={setName} />
    
    </nav>
  )
}

export default Nav;
