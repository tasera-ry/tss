import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dayview from './Dayview';
import api from '../api/api';
import testUtils from '../_TestUtils/TestUtils';
import { createAxiosMock } from '../_TestUtils/axiosMock';
import * as axios from 'axios';

// Mock the InfoBox component
vi.mock('../infoBox/InfoBox', () => ({
  default: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock('axios', () => ({
  get: vi.fn(),
}));

axios.get.mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});

const { schedule } = testUtils;
const date = new Date('2020-10-21T11:30:57.000Z');
const state = {
  state: 'ready',
  date,
  weekNro: 0,
  dayNro: 0,
  yearNro: 0,
};

const history = createMemoryHistory();

describe('testing Dayview component', () => {
  it('should render Dayview', async () => {
    api.getSchedulingDate = vi.fn(() => schedule);
    localStorage.setItem('language', '1');
    Date.now = vi.fn(() => '2020-10-21T11:30:57.000Z');

    render(
      <Router>
        <Dayview history={history} match={{ params: { date } }} state={state} />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByText('Back to weekview')).toBeInTheDocument(),
    );
  });

  it('should change to previous and next day', async () => {
    localStorage.setItem('language', '1');
    Date.now = vi.fn(() => '2020-10-21T11:30:57.000Z');

    render(
      <Router>
        <Dayview history={history} match={{ params: { date } }} state={state} />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByText('21.10.2020')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('previousDay'));
    await waitFor(() =>
      expect(screen.getByText('20.10.2020')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('nextDay'));
    await waitFor(() =>
      expect(screen.getByText('21.10.2020')).toBeInTheDocument(),
    );
  });

  it('should show range officer status', async () => {
    localStorage.setItem('language', '1');
    Date.now = vi.fn(() => '2020-10-21T11:30:57.000Z');
    api.getSchedulingDate = vi.fn(() => ({
      ...schedule,
      rangeSupervision: 'closed',
    }));

    render(
      <Router>
        <Dayview
          history={history}
          match={{ params: { date } }}
          state={{ ...state, rangeSupervision: 'closed' }}
        />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByText('Range closed')).toBeInTheDocument(),
    );
  });

  it('should render the mocked InfoBox component', async () => {
    api.getSchedulingDate = vi.fn(() => schedule);
    localStorage.setItem('language', '1');
    Date.now = vi.fn(() => '2020-10-21T11:30:57.000Z');

    render(
      <Router>
        <Dayview history={history} match={{ params: { date } }} state={state} />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('mockInfoBox')).toBeInTheDocument(),
    );
  });
});
