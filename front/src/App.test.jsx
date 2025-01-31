import '@testing-library/jest-dom';
import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import * as utils from './utils/Utils';
import App from './App';
import testUtils from './_TestUtils/TestUtils';
import axios from 'axios';

vi.mock('axios');
vi.mock('./utils/Utils');
// Mock the InfoBox component
vi.mock('./infoBox/InfoBox', () => ({
  default: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

axios.get = vi.fn().mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});

const { date, week, schedule } = testUtils;

describe('testing App', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    utils.getSchedulingWeek = vi.fn(() => week);
    utils.getSchedulingDate = vi.fn(() => schedule);
    utils.validateLogin = vi.fn(() => Promise.resolve(false));
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
    Date.now = vi.fn(() => '2020-10-21T11:30:57.000Z');

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
