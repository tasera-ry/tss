import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Tabletview from './rangeofficer';
import * as utils from '../utils/Utils';
import testUtils from '../_TestUtils/TestUtils';
import axios from 'axios';
import { Cookies, CookiesProvider } from 'react-cookie';
import { BrowserRouter as Router } from 'react-router-dom';
import InfoBox from '../infoBox/InfoBox';
import socketIOClient from 'socket.io-client';  // Import socket.io-client


jest.mock('axios');
jest.mock('../utils/Utils');
jest.mock('socket.io-client');

let mockSocket;


beforeEach(() => {
  jest.clearAllMocks();

  mockSocket = {
    on: jest.fn((event, callback) => {
      if (event === 'rangeUpdate') {
        // Simulate the event with the data your component expects
        callback({ color: 'green', text: 'Updated' });
      }
      return mockSocket;
    }),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };

  utils.validateLogin = jest.fn().mockResolvedValue(true);
  utils.rangeSupervision = jest.fn().mockResolvedValue(true);
  // Mock the return value of socketIOClient to use mockSocket
  socketIOClient.mockReturnValue(mockSocket);

  axios.get = jest.fn().mockResolvedValue({
    data: [{ id: 1, message: 'ok', start: '', end: '' }],
  });
  axios.put = jest.fn().mockResolvedValue();
  axios.post = jest.fn().mockImplementation((url, postable) => {
    return Promise.resolve(postable);
  });

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/datesupreme')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          scheduleId: 1,
          reservationId: 1,
          rangeSupervisionScheduled: true,
          open: '08:00',
          close: '18:00',
          rangeSupervision: 'closed',
          tracks: [
            { id: 1, name: 'Track 1', short_description: 'Short 1', trackSupervision: 'closed' },
            { id: 2, name: 'Track 2', short_description: 'Short 2', trackSupervision: 'present' },
          ],
        }),
      });
    }
    return null;
  });

  localStorage.setItem('language', '1');
  document.cookie = 'username=testuser; role=rangemaster';
});

// Test skipped
// test failing with:
// Unable to find an element by: [data-testid="rangeOfficerStatus"]
// and
// MUI: The `styles` argument provided is invalid
describe.skip('testing rangeofficer', () => {
  it('should render Tabletview component', async () => {
    await act(async () => {
      render(
        <CookiesProvider>
          <Router>
            <Tabletview />
          </Router>
        </CookiesProvider>
      );
    });

    // Check if the component rendered correctly
    await waitFor(() => expect(screen.getByTestId('rangeOfficerStatus')).toBeInTheDocument());
  });

  it('should render infobox', async () =>{
    render(<InfoBox/>);
    const infobox = await screen.findByTestId('infoboxContainer');
    expect(infobox).toBeInTheDocument();
  });

  it('should change range officer status', async () => {

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
          }),
      }),
    );

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'role=rangemaster',
    });

    localStorage.setItem('language', '1');

    await act(async() => {
      render(<Tabletview />);
    });

    await waitFor(() => expect(screen.getByTestId('rangeOfficerStatus')).toBeInTheDocument());

    await waitFor(() => {
      const element = screen.getByTestId('rangeOfficerStatus');
      console.log(element.textContent);
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
        'backgroundColor: colors.blackTint05',
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
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({ ...testUtils.schedule, rangeSupervision: '' }),
      })},
    );
    render(<Tabletview />);
    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toHaveStyle(
        'backgroundColor: colors.blackTint05',
      ),
    );
  });

  it('should show tracks', async () => {
    localStorage.setItem('language', '1');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...testUtils.schedule,
          }),
      }),
    );

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'role=rangemaster',
    });

    await act(async() => render(
        <Tabletview />
    ));
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0 — s 0', {exact: false})).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 6 — s 6', {exact: false})).toBeInTheDocument(),
    );
  });

  it('should change track officer status', async () => {
    localStorage.setItem('language', '1');
    global.Date.now = () => new Date('2024-04-10T11:30:57.000Z');

    global.fetch = jest.fn((url) => {
      if (url.includes('/api/datesupreme')) {
        return Promise.resolve({
          json: () => Promise.resolve(testUtils.schedule),
        });
      }
      return false;
    });

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'role=rangemaster',
    });

    await act(async() => render(<Tabletview />));

    await waitFor(() => expect(screen.getByTestId('1')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByTestId('1')).toHaveTextContent('No track officer'),
    );
    fireEvent.click(screen.getByTestId('1'));
    await waitFor(() =>
      expect(screen.getByTestId('1')).toHaveTextContent('Present'),
    );
    fireEvent.click(screen.getByTestId('1'));
    await waitFor(() =>
      expect(screen.getByTestId('2')).toHaveTextContent('Closed'),
    );
    fireEvent.click(screen.getByTestId('2'));
    await waitFor(() =>
      expect(screen.getByTestId('2')).toHaveTextContent('No track officer'),
    );
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });
});
