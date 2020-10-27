import React, { Component } from "react";

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';

// function for checking whether we should show banner
// DialogWindow for supervisors to confirm their supervisions
import { checkSupervisorReservations, DialogWindow } from '../upcomingsupervisions/LoggedIn';

// Translations
import * as data from '../texts/texts.json';
const fin = localStorage.getItem("language"); //0: finnish, 1: english
const {banner} = data

class SupervisorNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userHasSupervisions: false,
      supervisionsOpen: false
    };
  }

  componentDidMount() {
    this.checkSupervisions();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loggingOut) {
      this.setState({
        userHasSupervisions: false
      })
      nextProps.setLoggingOut(false);
    }
    else if (nextProps.checkSupervisions) {
      this.checkSupervisions();
      nextProps.setCheckSupervisions(false);
    }
  }

  refreshSupervisionsOpen = () => {
    this.setState({
      supervisionsOpen: false
    })
  }

  checkSupervisions = async () => {
    const reservations = await checkSupervisorReservations();
    if (reservations) {
      this.setState({
        userHasSupervisions: true
      })
    }
    else {
      this.setState({
        userHasSupervisions: false
      })
    }
  }

  displaySupervisions = (e) => {
    this.setState({
      supervisionsOpen: true
    })
  }

  render() {
    return (
      <div>
        {this.state.userHasSupervisions ?
          <Alert
            severity="warning"
            variant="filled"
            action={
              <Button color="inherit" size="small">
                {banner.Check[fin]}
              </Button>
            }
            onClick={this.displaySupervisions}
          >{banner.Notification[fin]}
          </Alert> : null
        }
        {this.state.supervisionsOpen ?
          <DialogWindow
            onCancel={
              () => this.refreshSupervisionsOpen()
            }
          /> : ""}
      </div>
    )
  }
}

export default SupervisorNotification;
