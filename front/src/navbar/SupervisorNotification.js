import React, { Component } from 'react';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';

// function for checking whether we should show banner
// DialogWindow for supervisors to confirm their supervisions
import { checkSupervisorReservations, DialogWindow } from '../upcomingsupervisions/LoggedIn';

import { withCookies } from 'react-cookie';

// Translations
import data from '../texts/texts.json';

const fin = localStorage.getItem('language');  // eslint-disable-line
const { banner } = data;

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

  componentWillReceiveProps(nextProps) {  // eslint-disable-line
    if (nextProps.loggingOut) {
      this.setState({
        userHasSupervisions: false,
      });
      nextProps.setLoggingOut(false);
    } else if (nextProps.checkSupervisions) {
      this.checkSupervisions();
      nextProps.setCheckSupervisions(false);
    }
  }

  refreshSupervisionsOpen = () => {  // eslint-disable-line
    this.setState({
      supervisionsOpen: false,
    });
  }

  checkSupervisions = async () => {
    const reservations = await checkSupervisorReservations(this.props.cookies.username);
    if (reservations) {
      this.setState({
        userHasSupervisions: true,
      });
    } else {
      this.setState({
        userHasSupervisions: false,
      });
    }
  }

  displaySupervisions = (e) => {  // eslint-disable-line
    this.setState({
      supervisionsOpen: true,
    });
  }

  render() {
    const fin = localStorage.getItem('language'); // eslint-disable-line
    return (
      <div>
        {this.state.userHasSupervisions
          ? (
            <Alert
              severity="warning"
              variant="filled"
              action={(
                <Button color="inherit" size="small">
                  {banner.Check[fin]}
                </Button>
            )}
              onClick={this.displaySupervisions}
            >
              {banner.Notification[fin]}
            </Alert>
          ) : null}
        {this.state.supervisionsOpen
          ? (
            <DialogWindow
              onCancel={() => this.refreshSupervisionsOpen()}
            />
          ) : ''}
      </div>
    );
  }
}

export default withCookies(SupervisorNotification);
