import React, { Component } from "react";

import "./App.css";

// Custom components
import SignIn from "./signin/SignIn";
import Nav from "./navbar/Nav";
import Dayview from "./dayview/Dayview";
import Weekview from "./weekview/Weekview";
import Trackview from "./trackview/Trackview";
import Scheduling from "./scheduling/Scheduling";
import RangeOfficerView from "./tabletview/rangeofficer";
import UserManagementView from "./usermanagement/UserManagementView";
import trackCRUD from "./edittracks/tracks";

// React router. Hashrouter, because normal router won't work in apache
import { HashRouter as Router, Switch, Route } from "react-router-dom";

/*
   The main component of the whole project.
*/
class App extends Component {
  state = {};

  render() {
    if(localStorage.getItem("language")===null) {
      localStorage.setItem("language", 0)
    }
      return (
         <Router>
            <div className="App">
               <header className="App-header">
                  <Nav />
                  <Switch>
                     <Route path="/" exact component={Weekview} />
                     <Route path="/signin" component={SignIn} />
                     <Route path="/dayview/:date?" component={Dayview} />
                     <Route path="/weekview" component={Weekview} />
                     <Route path="/trackview/:date?/:track?" component={Trackview} />
                     <Route path="/scheduling/:date?" component={Scheduling} />
                     <Route path="/tablet" component={RangeOfficerView} />
                    <Route path="/usermanagement" component={UserManagementView} />
                    <Route path="/tracks" component={trackCRUD} />
                  </Switch>
               </header>
            </div>
         </Router>
      );
   }
}

export default App;
