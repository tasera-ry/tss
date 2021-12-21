import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import Trackview from './Trackview';
import api from '../api/api';
import testUtils from '../_TestUtils/TestUtils';

describe('testing Trackview', () => {
  it('should render Trackview', async () => {
    const { date, schedule } = testUtils;

    api.getSchedulingDate = jest.fn(() => schedule);

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Trackview
          match={{
            params: {
              date,
              track: 'Shooting Track 0',
            },
          }}
        />
      </Router>,
    );
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );
  });
});
