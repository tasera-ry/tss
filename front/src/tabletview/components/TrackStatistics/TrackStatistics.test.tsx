import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import { TrackStatistics } from './TrackStatistics';
import testUtils from '../../../_TestUtils/TestUtils';
import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '../../../api/api';

vi.mock('../../../api/api')

describe('testing TrackStatistics', () => {

  it('should render TrackStatistics', async () => {
    render(
      <TrackStatistics
        track={testUtils.schedule.tracks[0]}
        supervision="absent"
        disabled={false}
      />, {wrapper: TestProviders}
    );
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
  });

  it('should increment visitor number', async () => {
    vi.mocked(api.patchScheduledSupervisionTrack).mockResolvedValue(undefined);
    render(
      <TrackStatistics
        track={testUtils.schedule.tracks[3]}
        supervision="present"
        disabled={false}
      />, {wrapper: TestProviders}
    );
    await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('+')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+'));
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+'));
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });
});
