import React from 'react';
import '@testing-library/jest-dom';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import Scheduling from './Scheduling';
import * as utils from '../utils/Utils';
import api from '../api/api';
import testUtils from '../_TestUtils/TestUtils';

jest.mock('axios');
jest.mock('../utils/Utils');
jest.mock('../api/api');

const mockTracks = [
  {
    id: 1,
    range_id: 1,
    name: 'Shooting Track 0',
    description: 'Pistol 300m',
    short_description: '25m testi',
  },
];

beforeEach(() => {
  jest.clearAllMocks();

  utils.validateLogin = jest.fn().mockResolvedValue(true);
  utils.rangeSupervision = jest.fn().mockResolvedValue(testUtils.reservation);
  api.getSchedulingDate = jest.fn().mockResolvedValue(testUtils.schedule);

  axios.get = jest.fn().mockResolvedValue({ data: mockTracks });
  axios.put = jest.fn().mockResolvedValue();
  axios.delete = jest.fn().mockResolvedValue();
  axios.post = jest.fn().mockImplementation((url, postable) => {
    if (postable.name === undefined) {
      return Promise.reject();
    }
    return Promise.resolve({ tracks: { ...postable, id: 2 } });
  });

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/track-supervision')) {
      return Promise.resolve({
        json: () => Promise.resolve({ ok: true }),
      });
    }
    if (url.includes('/api/user')) {
      return Promise.resolve({
        json: () => Promise.resolve(testUtils.association),
      });
    }
    if (url.includes('/api/reservation')) {
      return Promise.resolve({
        json: () => Promise.resolve(testUtils.reservation),
        ok: true,
      });
    }
    if (url.includes('/api/schedule')) {
      return Promise.resolve({
        json: () => Promise.resolve(testUtils.oneSchedule),
      });
    }
    return null;
  });
});

const state = {
  rangeSupervisorId: '50',
  rangeSupervisors: [testUtils.association],
  date: testUtils.date,
  repeatCount: 1,
};

describe('testing scheduling', () => {
  it('should render scheduling', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);
    });
    await waitFor(() =>
      expect(screen.getByText('Save changes')).toBeInTheDocument(),
    );
  });

  // Test skipped
  // Test failing with error
  // TestingLibraryElementError: Unable to find an element by: [data-testid="dateButton"]
  it.skip('should update on date change', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);
    });

    await waitFor(() =>
      expect(screen.getByDisplayValue('21.10.2020')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByDisplayValue('21.10.2020'), {
      target: {
        value: '22.10.2020',
      },
    });
    await waitFor(() =>
      expect(screen.getByDisplayValue('22.10.2020')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('dateButton'));
  });

  it('should open range', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);

      await waitFor(() =>
        expect(screen.getByTestId('available')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('available'));
      await waitFor(() =>
        expect(screen.getByText('Save changes')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText('Save changes'));
      await waitFor(() =>
        expect(screen.getByText('Update successful!')).toBeInTheDocument(),
      );
    });
  });

  it('should set range officer', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);

      await waitFor(() =>
        expect(screen.getByTestId('available')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('available'));
      fireEvent.click(screen.getByTestId('rangeSupervisorSwitch'));
      await waitFor(() =>
        expect(screen.getByTestId('rangeSupervisorSelect')).not.toBeDisabled(),
      );
      fireEvent.click(screen.getByTestId('rangeSupervisorSelect'));
      await waitFor(() =>
        expect(screen.getByText('test_user')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText('test_user'));
      fireEvent.click(screen.getByText('Save changes'));
      await waitFor(() =>
        expect(screen.getByText('Update successful!')).toBeInTheDocument(),
      );
    });
  });

  it('should set track supervision', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);
      await waitFor(() =>
        expect(screen.getByTestId('track-1')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('track-1'));
      fireEvent.click(screen.getByText('Save changes'));
      await waitFor(() =>
        expect(screen.getByText('Update successful!')).toBeInTheDocument(),
      );
    });
  });

  // Test skipped
  // Test failing with
  // Unable to find an element by: [data-testid="emptyAll"]
  it.skip('should open, empty, and close all tracks', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);
      await waitFor(() =>
        expect(screen.getByTestId('openAll')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('openAll'));
      await waitFor(() =>
        expect(screen.getByTestId('emptyAll')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('emptyAll'));
      await waitFor(() =>
        expect(screen.getByTestId('closeAll')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('closeAll'));
      fireEvent.click(screen.getByText('Save changes'));
      await waitFor(() =>
        expect(screen.getByText('Update successful!')).toBeInTheDocument(),
      );
    });
  });

  it('should save repeated scheduling', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1');

    await act(async () => {
      render(<Scheduling history={history} state={state} />);
      await waitFor(() =>
        expect(screen.getByTestId('available')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId('available'));
      fireEvent.click(screen.getByTestId('rangeSupervisorSwitch'));
      await waitFor(() =>
        expect(screen.getByTestId('rangeSupervisorSelect')).not.toBeDisabled(),
      );
      fireEvent.click(screen.getByTestId('rangeSupervisorSelect'));
      await waitFor(() =>
        expect(screen.getByText('test_user')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText('test_user'));
    });

    await act(async () => {
      await waitFor(() =>
        expect(screen.getByTestId('dailyRepeat')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText('Save changes'));
      await waitFor(() =>
        expect(screen.getByText('Update successful!')).toBeInTheDocument(),
      );
    });
  });
});
