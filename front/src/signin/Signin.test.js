import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import SignIn from './SignIn';

describe('testing SignIn component', () => {
  it('should render SignIn', async () => {
    localStorage.setItem('language', '1');
    render(
      <Router>
        <SignIn />
      </Router>,
    );
    await waitFor(() => expect(screen.getByText('Sign In'))
      .toBeInTheDocument());
  });
});
