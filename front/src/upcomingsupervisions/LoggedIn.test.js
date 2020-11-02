import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  waitFor,
  render,
  screen,
} from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { DialogWindow } from './LoggedIn';

describe('testing LoggedIn', () => {
  it('should render LoggedIn', async () => {
    localStorage.setItem('language', '1');
    act(() => {
      render(
        <Router>
          <DialogWindow />
        </Router>,
      );
    });
    await waitFor(() => expect(screen.getByText('Confirm supervisions'))
      .toBeInTheDocument());
  });
});
