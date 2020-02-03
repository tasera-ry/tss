import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import logo from './logo.svg';
import './App.css';
import SignIn from './SignIn'
import Nav from './Nav';
import Dayview from './Dayview';
import Weekview from './Weekview';
import Monthlyview from './Monthlyview'; 
import Home from './Home';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';

class App extends Component {
  state = {
    
  };

  render() {
	  return (
    <Router>
		<div className="App">
		  <header className="App-header">
      <Nav/>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/signin" component={SignIn} />
        <Route path="/dayview" component={Dayview} />
        <Route path="/weekview" component={Weekview} />
        <Route path="/monthlyview" component={Monthlyview} />
      </Switch>
      </header>
		</div>
    </Router>
	  );
  }
}

export default App;
