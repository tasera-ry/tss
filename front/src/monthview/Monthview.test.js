import React from 'react';
import * as InfoBox from '../infoBox/InfoBox';
import * as Infoboxes from '../infoboxes/Infoboxes';

import '@testing-library/jest-dom/extend-expect';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import * as utils from '../utils/Utils';
import Monthview from './Monthview';
import monthTestUtil from '../_TestUtils/monthTestUtil';
import axios from 'axios';

jest.mock('axios');
axios.get.mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});
const mockMonth = monthTestUtil.month;

const history = createMemoryHistory();

describe('testing monthview', () => {
  global.window = Object.create(window);
  const defineUrl = (params) => {
    Object.defineProperty(window, 'location', {
      value: {
        href: `https://tss.tasera.fi/#${params}`,
      },
      writable: true,
    });
  };

  it('should render monthView when URL is broken/invalid', async () => {
    utils.getSchedulingFreeform = jest.fn(() => ({
      month: mockMonth('09', '28'),
    }));
    Date.now = jest.fn(() => '2020-10-21T11:30:57.000Z');

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview history={history} />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByText('October, 2020')).toBeInTheDocument(),
    );
  });

  it('should change to previous, current and next month', async () => {
    utils.getSchedulingFreeform = jest.fn(() => ({
      month: mockMonth('09', '28'),
    }));
    localStorage.setItem('language', '1');
    Date.now = jest.fn(() => '2020-10-21T11:30:57.000Z');
    history.replace = jest.fn((params) => defineUrl(params));
    render(
      <Router>
        <Monthview history={history} />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByText('October, 2020')).toBeInTheDocument(),
    );
    utils.getSchedulingFreeform = jest.fn(() => ({
      month: mockMonth('08', '31'),
    }));
    fireEvent.click(screen.getByTestId('previousMonth'));
    await waitFor(() =>
      expect(screen.getByText('September, 2020')).toBeInTheDocument(),
    );
    utils.getSchedulingFreeform = jest.fn(() => ({
      month: mockMonth('09', '28'),
    }));
    fireEvent.click(screen.getByTestId('nextMonth'));
    await waitFor(() =>
      expect(screen.getByText('October, 2020')).toBeInTheDocument(),
    );
    utils.getSchedulingFreeform = jest.fn(() => ({
      month: mockMonth('10', '26'),
    }));
    fireEvent.click(screen.getByTestId('nextMonth'));
    await waitFor(() =>
      expect(screen.getByText('November, 2020')).toBeInTheDocument(),
    );
  });
});
