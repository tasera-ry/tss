import '@testing-library/jest-dom';
import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import { getSchedulingWeek } from '../utils/Utils';
import Weekview from './Weekview';
import testUtils from '../_TestUtils/TestUtils';
import * as axios from 'axios';

const { date, week } = testUtils;

// Mock the InfoBox component
vi.mock('../infoBox/InfoBox', () => ({
  default: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock(import("../utils/Utils"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getSchedulingWeek: vi.fn(),
  }
})
getSchedulingWeek.mockResolvedValue(week);

vi.mock('axios', () => ({
  get: vi.fn(),
}));
axios.get.mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});

describe('testing weekview', () => {
  it('should render weekView', async () => {
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
      expect(screen.getByText('Range officer present')).toBeInTheDocument(),
    );
  });

  it('should render the mocked InfoBox component', async () => {
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
      expect(screen.getByTestId('mockInfoBox')).toBeInTheDocument(),
    );
  });
});
