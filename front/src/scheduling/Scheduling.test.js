import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  waitFor,
  render,
  screen,
} from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import Scheduling from './Scheduling';

describe('testing scheduling', () => {
  it('should render scheduling', async () => {
    const history = createMemoryHistory();

    localStorage.setItem('language', '1');
    await act(async () => {
      render(
        <Router>
          <Scheduling
            history={history}
          />
        </Router>,
      );
    });
    await waitFor(() => expect(screen.getByText('Save changes'))
      .toBeInTheDocument());
  });
});
