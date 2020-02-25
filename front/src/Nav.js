import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import logo from "./Logo.png";

function Nav() {
  const navStyle = {
    color: "black"
  };
  const logoStyle = {
    textDecoration: "none",
    height: "100%",
    width: "60%",
    display: "inline-block"
  };

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
      <Link style={navStyle} to="/signin">
        <p>Kirjaudu sisään</p>
      </Link>
    </nav>
  );
}

export default Nav;
