import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    data: null,
    pings:0
  };

  ping = () => {
    this.setState((state) => {
      return {pings: state.pings + 1};
    });
    this.callApi()
      .then(res => this.setState({ data: res.ping }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/ping');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    console.log(body);
    return body;
  };

  render() {
	  return (
		<div className="App">
		  <header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<p>
			  React frontend.
			</p>
      <Badge badgeContent={this.state.pings} color="secondary">
        <Button variant="contained" onClick={this.ping}>Ping server</Button>
      </Badge>
      </header>
		</div>
	  );
  }
}

export default App;
