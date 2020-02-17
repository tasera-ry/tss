import React from "react";
import "./App.css";
import { Link } from "react-router-dom";

function Home() {
  const logoStyle = {
    color: "black"
  };

  return (
    <div>
      <Link style={logoStyle} to="/trackview">
        <h3>Trackview</h3>
      </Link>
      <Link style={logoStyle} to="/dayview">
        <h3>Dayview</h3>
      </Link>
      <Link style={logoStyle} to="/weekview">
        <h3>Weekview</h3>
      </Link>
      <Link style={logoStyle} to="/monthlyview">
        <h3>Monthlyview</h3>
      </Link>
      <Link style={logoStyle} to="/signin">
        <h3>Signin</h3>
      </Link>
    </div>
  );
}

export default Home;
