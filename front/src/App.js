import React, { Component } from "react";
import "./App.css";
import SignIn from "./SignIn";
import Nav from "./Nav";
import Dayview from "./Dayview";
import Weekview from "./Weekview";
import Trackview from "./Trackview";
import Scheduling from "./Scheduling";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import RangeOfficerView from "./rangeofficer";

class App extends Component {
  state = {};

  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Nav />
            <Switch>
              <Route path="/" exact component={Weekview} />
              <Route path="/signin" component={SignIn} />
              <Route path="/dayview/:date?" component={Dayview} />
              <Route path="/weekview/:date?" component={Weekview} />
              <Route path="/trackview/:date?/:track?" component={Trackview} />
              <Route path="/scheduling/:date?" component={Scheduling} />
              <Route path="/tablet" component={RangeOfficerView} />
            </Switch>
          </header>
        </div>
      </Router>
    );
  }
}

export default App;
