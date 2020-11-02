import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import TrackCRUD from './tracks';
import * as utils from '../utils/Utils';

jest.mock('axios');

describe('testing TrackCRUD component', () => {
  it('should render TrackCRUD', async () => {
    const mockTracks = [
      {
        id: 1,
        range_id: 1,
        name: 'Shooting Track 0',
        description: 'Pistol 300m',
      },
    ];

    const data = { data: mockTracks };
    axios.get.mockImplementationOnce(() => Promise.resolve(data));
    utils.validateLogin = jest.fn(() => true);
    await act(async () => {
      localStorage.setItem('language', '1'); // eslint-disable-line
      render(
        <Router>
          <TrackCRUD
            axios={axios}
          />
        </Router>,
      );
    });
    await waitFor(() => expect(screen.getByText('Tracks'))
      .toBeInTheDocument());
  });
});
