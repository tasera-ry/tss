import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import SignIn from './SignIn';

axios.get = jest.fn(() => Promise.resolve({ data: [{ role: 'supervisor' }] }));
axios.post = jest.fn((url, credentials) => {
  console.log(credentials)
  if (credentials.name === 'wrong_username') {
    return (Promise.reject());
  }
  return Promise.resolve({ data: 'dummy token' });
});

describe('testing SignIn component', () => {
  it('should render SignIn', async () => {
    localStorage.setItem('language', '1');
    render(<SignIn />);
    await waitFor(() => expect(screen.getByText('Sign In')).toBeInTheDocument());
  });

  it('should give error on wrong credentials', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      render(<SignIn />);

      await waitFor(() => expect(screen.getByTestId('nameField')).toBeInTheDocument());
      screen.debug();
      fireEvent.change(screen.getByTestId('nameField'), {
        target: {
          value: 'wrong_username',
        },
      });
      // fireEvent.change(screen.getByTestId('passwordField *'), {
      //   target: {
      //     value: 'wrong_password',
      //   },
      // });
      await waitFor(() => expect(screen.getByText('wrong_username')).toBeInTheDocument());
      // screen.debug();
      // fireEvent.click(screen.getByText('Log in'));
      // await waitFor(() => expect(screen.getByText('Wrong username or password')).toBeInTheDocument());
    });

  });
});
