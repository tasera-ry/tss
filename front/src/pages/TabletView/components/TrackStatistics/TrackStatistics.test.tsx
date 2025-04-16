import { TestProviders } from '@/_TestUtils/TestProvides';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import testUtils from '../../../../_TestUtils/TestUtils';
import api from '../../../../api/api';
import { TrackStatistics } from './TrackStatistics';

vi.mock('../../../../api/api');

describe('testing TrackStatistics', () => {
  it('should render TrackStatistics', async () => {
    render(
      <TrackStatistics
        track={testUtils.schedule.tracks[0]}
        superVisionState={testUtils.schedule.tracks[0].trackSupervision}
        disabled={false}
      />,
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
  });

  it('should increment visitor number', async () => {
    vi.mocked(api.patchScheduledSupervisionTrack).mockResolvedValue(undefined);
    render(
      <TrackStatistics
        track={testUtils.schedule.tracks[3]}
        superVisionState={testUtils.schedule.tracks[3].trackSupervision}
        disabled={false}
      />,
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('+')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+'));
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+'));
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });
});
