import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import Tabletview from './rangeofficer';
import * as utils from '../utils/Utils';
import testUtils from '../_TestUtils/TestUtils';

axios.put = jest.fn(() => Promise.resolve());
axios.post = jest.fn((url, postable) => Promise.resolve(postable));

utils.validateLogin = jest.fn(() => Promise.resolve(true));
utils.rangeSupervision = jest.fn(() => Promise.resolve(true));

global.fetch = jest.fn((url) => {
  if (url.includes('/api/datesupreme')) {
    return Promise.resolve({
      json: () => Promise.resolve(testUtils.schedule),
    });
  }
  return false;
});

describe('testing rangeofficer', () => {
  it('should render Tabletview', async () => {
    localStorage.setItem('language', '1');
    await act(async () => {
      render(<Tabletview />);
    });
    await waitFor(() =>
      expect(
        screen.getByText('Define range officer status by choosing color'),
      ).toBeInTheDocument(),
    );
  });

  it('should change range officer status', async () => {
    await act(async () => {
      render(<Tabletview />);
    });

    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveTextContent(
        'Closed',
      ),
    );
    fireEvent.click(screen.getByTestId('tracksupervisorPresent'));
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveTextContent(
        'Range officer present',
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.green',
      ),
    );
    fireEvent.click(screen.getByTestId('tracksupervisorOnWay'));
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveTextContent(
        'Range officer on the way',
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.orange',
      ),
    );
    fireEvent.click(screen.getByTestId('tracksupervisorClosed'));
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveTextContent(
        'Closed',
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.redLight',
      ),
    );
  });

  it('should show correct color when present', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
            rangeSupervision: 'present',
          }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.green',
      ),
    );
  });
  it('should show correct color when en route', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
            rangeSupervision: 'en route',
          }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.orange',
      ),
    );
  });
  it('should show correct color when absent', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
            rangeSupervision: 'absent',
          }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.cream5',
      ),
    );
  });
  it('should show correct color when closed', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
            rangeSupervision: 'closed',
          }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.redLight',
      ),
    );
  });
  it('should show correct color when confirmed', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
            rangeSupervision: 'confirmed',
          }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.greenLight',
      ),
    );
  });
  it('should show correct color when not confirmed', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
            rangeSupervision: 'not confirmed',
          }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.turquoise',
      ),
    );
  });
  it('should show correct color when no defined range officer', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...testUtils.schedule, rangeSupervision: '' }),
      }),
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.cream5',
      ),
    );
  });

  it('should show tracks', async () => {
    localStorage.setItem('language', '1');
    await act(async () => {
      render(<Tabletview />);
    });
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0 — s 0')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 6 — s 6')).toBeInTheDocument(),
    );
  });

  it('should change track officer status', async () => {
    localStorage.setItem('language', '1');
    global.Date.now = () => new Date('2020-10-21T11:30:57.000Z');

    await act(async () => {
      render(<Tabletview />);
    });

    await waitFor(() => expect(screen.getByTestId('1')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByTestId('1')).toHaveTextContent('No track officer'),
    );
    fireEvent.click(screen.getByTestId('1'));
    await waitFor(() =>
      expect(screen.getByTestId('1')).toHaveTextContent('Closed'),
    );
    fireEvent.click(screen.getByTestId('1'));
    await waitFor(() =>
      expect(screen.getByTestId('2')).toHaveTextContent('Closed'),
    );
    fireEvent.click(screen.getByTestId('2'));
    await waitFor(() =>
      expect(screen.getByTestId('2')).toHaveTextContent('Present'),
    );
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });
});
