import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import Dayview from './Dayview';

describe('testing Dayview component', () => {
  it('should render Dayview', async () => {
    const history = createMemoryHistory();
    const date = new Date('2020-10-21T11:30:57.000Z');

    localStorage.setItem('language', '1'); // eslint-disable-line
    const state = {
      state: 'loading',
      date,
      weekNro: 0,
      dayNro: 0,
      yearNro: 0,
    };
    Date.now = jest.fn(() => '2020-10-21T11:30:57.000Z');
    render(
      <Router>
        <Dayview
          history={history}
          match={{ params: { date } }}
          state={state}
        />
      </Router>,
    );
    await waitFor(() => expect(
      screen.getByText('Back to weekview'),
    )
      .toBeInTheDocument());
  });
});
