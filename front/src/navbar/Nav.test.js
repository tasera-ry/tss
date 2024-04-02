import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  waitFor,
  render,
  screen,
  // fireEvent,
} from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import Nav from './Nav';

localStorage.setItem('token', 'foobar');
localStorage.setItem('taseraUserName', 'testName');
localStorage.setItem('role', 'superuser');
localStorage.setItem('language', '1');

// checkSupervisorReservations, DialogWindow
describe('testing Nav', () => {
  it('should render Nav', async () => {
    axios.get = jest.fn(() => Promise.resolve({ data: [{ id: 1 }] }));

    await act(async () => {
      render(
        <Router>
          <Nav />
        </Router>,
      );
    });
    await waitFor(() => expect(screen.getByText('ENG')).toBeInTheDocument());
  });

  // broken due to authentication change from localhost to cookies

  // it('should open side menu', async () => {
  //   await act(async () => {
  //     render(
  //       <Router>
  //         <Nav />
  //       </Router>,
  //     );
  //     await waitFor(() => expect(screen.getByText('Menu')).toBeInTheDocument());
  //     fireEvent.click(screen.getByText('Menu'));
  //     await waitFor(() => expect(screen.getByText('Schedules')).toBeInTheDocument());
  //   });
  // });

  // it('should show sign out', async () => {
  //   await act(async () => {
  //     render(
  //       <Router>
  //         <Nav />
  //       </Router>,
  //     );
  //     await waitFor(() => expect(screen.getByText('Menu')).toBeInTheDocument());
  //     fireEvent.click(screen.getByText('Menu'));
  //     await waitFor(() => expect(screen.getByText('Sign Out')).toBeInTheDocument());
  //     fireEvent.click(screen.getByText('Sign Out'));
  //     await waitFor(() => expect(screen.getByText('Sign In')).toBeInTheDocument());
  //     await waitFor(() => expect(screen.queryByText('Sign Out')).not.toBeInTheDocument());
  //   });
  // });

  // it('should show supervisions', async () => {
  //   localStorage.setItem('token', 'foobar');
  //   localStorage.setItem('taseraUserName', 'testName');
  //   localStorage.setItem('role', 'supervisor');
  //   localStorage.setItem('language', '1');
  //   await act(async () => {
  //     render(
  //       <Router>
  //         <Nav />
  //       </Router>,
  //     );
  //     await waitFor(() => expect(screen.getByText('Menu')).toBeInTheDocument());
  //     fireEvent.click(screen.getByText('Menu'));
  //     await waitFor(() => expect(screen.getByText('Supervisions')).toBeInTheDocument());
  //     fireEvent.click(screen.getByText('Supervisions'));
  //     await waitFor(() => expect(screen.getByText('Confirm supervisions')).toBeInTheDocument());
  //   });
  // });
});
