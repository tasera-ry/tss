import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { waitFor, render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import * as utils from '../utils/Utils';
import Weekview from './Weekview';
import testUtils from '../_TestUtils/TestUtils';
import * as axios from 'axios';

jest.mock('../_TestUtils/TestUtils', () => ({
  getSchedulingWeek: jest.fn(),
  getSchedulingDate: jest.fn(),
}));

jest.mock('axios');
axios.get.mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});

const { date, week, schedule } = testUtils;

describe('testing weekview', () => {
  it('should render weekView', async () => {
    utils.getSchedulingWeek = jest.fn(() => week);
    utils.getSchedulingDate = jest.fn(() => schedule);
    const state = {
      state: 'loading',
      date,
      weekNro: 43,
      dayNro: 21,
      yearNro: 2020,
      paivat: week,
    };
    const history = createMemoryHistory();
    Date.now = jest.fn(() => '2020-10-21T11:30:57.000Z');

    localStorage.setItem('language', '1');
    await act(async () => {
      render(
        <Router>
          <Weekview
            match={{ params: { date } }}
            history={history}
            state={state}
          />
        </Router>,
      );
    });
    await waitFor(() =>
      expect(screen.getByText('Range officer present')).toBeInTheDocument()
  );
  });    

  describe('checks that arriving_at is on correct date', () => {
    it('should check if arriving_at is on the correct date', async () => {
      const state = {
        paivat: [
          {
            arriving_at: '2022-01-01T16:00:00'
          }
        ]
      };

      const date = '2022-01-01';
      const history = {};

      Date.now = jest.fn(() => '2020-10-21T11:30:57.000Z');

      localStorage.setItem('language', '1');

      await act(async () => {
        const { getByText } = render(
          <Router>
            <Weekview
              match={{ params: { date } }}
              history={history}
              state={state}
            />
          </Router>
      );

      // Find element with arriving_at date
      const arrivalTimeElement = getByText('16:00');

      // Check if displayed date matches expected date
      expect(arrivalTimeElement).toBeInTheDocument();
    });
  });
 });
});