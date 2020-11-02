import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  waitFor,
  render,
  screen,
} from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Nav from './Nav';

describe('testing Nav', () => {
  it('should render Nav', async () => {
    localStorage.setItem('language', '1');
    await act(async () => {
      render(
        <Router>
          <Nav />
        </Router>,
      );
    });
    await waitFor(() => expect(screen.getByText('FI'))
      .toBeInTheDocument());
  });
});
