import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import TrackCRUD from './tracks';
import * as utils from '../utils/Utils';

jest.mock('axios');

const mockTracks = [
  {
    id: 1,
    range_id: 1,
    name: 'Shooting Track 0',
    description: 'Pistol 300m',
    short_description: '25m testi',
  },
];
const data = { data: mockTracks };
utils.validateLogin = jest.fn(() => true);

describe('testing TrackCRUD component', () => {
  it('should render TrackCRUD', async () => {
    axios.get = jest.fn(() => Promise.resolve(data));

    await act(async () => {
      localStorage.setItem('language', '1');
      render(
        <Router>
          <TrackCRUD
            axios={axios}
          />
        </Router>,
      );
    });
    await waitFor(() => expect(screen.getByText('Shooting Track 0'))
      .toBeInTheDocument());
  });

  it('should show modified track in list and call axios post', async () => {
    axios.get = jest.fn(() => Promise.resolve(data));
    axios.put = jest.fn(() => Promise.resolve());

    await act(async () => {
      localStorage.setItem('language', '1');
      render(
        <Router>
          <TrackCRUD
            axios={axios}
          />
        </Router>,
      );
    });
    fireEvent.click(screen.getByTitle('Edit'));
    fireEvent.change(screen.getByPlaceholderText('Short description'), {
      target: {
        value: 'new short description',
      },
    });
    fireEvent.click(screen.getByTitle('Save'));
    await waitFor(() => expect(screen.getByText('new short description')).toBeInTheDocument());
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });
  // it('should add new track in list and call axios post', async () => {
  //   axios.get = jest.fn(() => Promise.resolve(data));
  //   axios.post = jest.fn(() => Promise.resolve());

  //   await act(async () => {
  //     localStorage.setItem('language', '1');
  //     render(
  //       <Router>
  //         <TrackCRUD
  //           axios={axios}
  //         />
  //       </Router>,
  //     );
  //   });
  //   fireEvent.click(screen.getByTitle('Edit'));
  //   fireEvent.change(screen.getByPlaceholderText('Short description'), {
  //     target: {
  //       value: 'new short description',
  //     },
  //   });
  //   fireEvent.click(screen.getByTitle('Save'));
  //   await waitFor(() => expect(screen.getByText('new short description')).toBeInTheDocument());
  //   await waitFor(() => expect(axios.put).toHaveBeenCalled());
  // });
  // it('should remove deleted track in list and call axios delete', async () => {

  // });
});
