import React from 'react';
import '@testing-library/jest-dom';
import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import * as utils from './utils/Utils';
import App from './App';
import testUtils from './_TestUtils/TestUtils';
import axios from 'axios';

jest.mock('axios');
jest.mock('./utils/Utils');
// Mock the InfoBox component
jest.mock('./infoBox/InfoBox', () => () => <div data-testid="mockInfoBox">Mock InfoBox</div>);

axios.get = jest.fn().mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});

const { date, week, schedule } = testUtils;

describe('testing App', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    utils.getSchedulingWeek = jest.fn(() => week);
    utils.getSchedulingDate = jest.fn(() => schedule);
    utils.validateLogin = jest.fn(() => Promise.resolve(false));
    localStorage.setItem('token', 'dummy_token');
  });

  it('should render App', async () => {
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

    await act(async () => {
      render(
        <Router>
          <App match={{ params: { date } }} history={history} state={state} />
        </Router>,
      );
    });
    await waitFor(() =>
      expect(screen.getByText('Päävalvoja paikalla')).toBeInTheDocument(),
    );
  });
});
