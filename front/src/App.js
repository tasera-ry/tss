import React, { Component } from "react";
import "./App.css";
import SignIn from "./SignIn";
import Nav from "./Nav";
import Dayview from "./Dayview";
import Weekview from "./Weekview";
import Home from "./Home";
import Trackview from "./Trackview";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

class App extends Component {
  state = {};

  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Nav />
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/signin" component={SignIn} />
              <Route path="/dayview/:date?" component={Dayview} />
              <Route path="/weekview" component={Weekview} />
              <Route path="/trackview" component={Trackview} />
            </Switch>
          </header>
        </div>
      </Router>
    );
  }
}

export default App;
