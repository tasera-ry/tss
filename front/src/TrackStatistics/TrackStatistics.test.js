import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  waitFor,
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import axios from 'axios';
import { TrackStatistics } from './TrackStatistics';
import testUtils from '../_TestUtils/TestUtils';

axios.put = jest.fn(() => Promise.resolve());

describe('testing TrackStatistics', () => {
  it('should render TrackStatistics', async () => {
    render(<TrackStatistics track={testUtils.schedule.tracks[0]} supervision="absent" />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
  });
  it('should increment visitor number', async () => {
    render(<TrackStatistics track={testUtils.schedule.tracks[0]} supervision="absent" />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+'));
    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument());
    fireEvent.click(screen.getByText('-'));
    fireEvent.click(screen.getByText('-'));
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });
});
