import { TestProviders } from '@/_TestUtils/TestProvides';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import testUtils from '../../_TestUtils/TestUtils';
import api from '../../api/api';
import * as utils from '../../utils/Utils';
import { TabletView } from './TabletView';

vi.mock('axios');
vi.mock('../../api/api');
vi.mock('../../utils/Utils');

vi.mock('socket.io-client', () => {
  const client = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };

  client.on.mockReturnValue(client);
  client.off.mockReturnValue(client);
  client.emit.mockReturnValue(client);
  client.disconnect.mockReturnValue(client);
  return {
    io: () => client,
  };
});

vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

describe('testing rangeofficer', () => {
  beforeEach(() => {
    vi.mocked(utils.validateLogin).mockResolvedValue(true);
    vi.mocked(api.getSchedulingDate).mockResolvedValue(testUtils.schedule);
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'role=rangemaster',
    });
  });

  it('should render TabletView', async () => {
    await act(async () => {
      render(<TabletView />, { wrapper: TestProviders });
    });

    await waitFor(() =>
      expect(screen.getByTestId('rangeOfficerStatus')).toBeInTheDocument(),
    );
  });

  it('should render tracks', async () => {
    await act(async () => render(<TabletView />, { wrapper: TestProviders }));

    await waitFor(() =>
      expect(
        screen.getByText('Shooting Track 0', { exact: false }),
      ).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByText('Shooting Track 6', { exact: false }),
      ).toBeInTheDocument(),
    );
  });

  it('should render track officer status', async () => {
    await act(async () => render(<TabletView />, { wrapper: TestProviders }));
    testUtils.schedule.tracks.forEach((track) => {
      expect(
        screen.getByTestId(`trackSupervisorButton-${track.id}`),
      ).toBeInTheDocument();
    });
  });
  describe('marking a track officer present (B10, #464)', () => {
    const renderWith = async (overrides: object) => {
      vi.mocked(api.getSchedulingDate).mockResolvedValue({
        ...testUtils.schedule,
        ...overrides,
      });
      await act(async () => render(<TabletView />, { wrapper: TestProviders }));
      return screen.findByTestId('trackSupervisorButton-1');
    };
    const sent = () =>
      vi
        .mocked(api.patchScheduledSupervisionTrack)
        .mock.calls.map(([, trackId, body]) => [
          trackId,
          body.track_supervisor,
        ]);

    beforeEach(() => {
      vi.mocked(api.patchScheduledSupervisionTrack).mockReset();
      vi.mocked(api.patchScheduledSupervisionTrack).mockResolvedValue(
        {} as never,
      );
    });

    it('marks the track officer present while the range officer is present', async () => {
      fireEvent.click(await renderWith({ rangeSupervision: 'present' }));
      await waitFor(() => expect(sent()).toEqual([[1, 'present']]));
      expect(screen.queryByTestId('officerAway')).not.toBeInTheDocument();
    });

    it('skips present while the range officer is away, and says why', async () => {
      const button = await renderWith({ rangeSupervision: 'confirmed' });
      expect(screen.getByTestId('officerAway')).toHaveTextContent(
        'The range officer is not present, so the track officer cannot be marked present.',
      );
      fireEvent.click(button);
      await waitFor(() => expect(sent()).toEqual([[1, 'closed']]));
    });

    it('lets a track that needs no range officer be marked present', async () => {
      const tracks = testUtils.schedule.tracks.map((track) =>
        track.id === 1 ? { ...track, requires_range_officer: false } : track,
      );
      fireEvent.click(
        await renderWith({ rangeSupervision: 'confirmed', tracks }),
      );
      await waitFor(() => expect(sent()).toEqual([[1, 'present']]));
    });

    it('tells the officer when the server refuses, instead of failing silently', async () => {
      vi.mocked(api.patchScheduledSupervisionTrack).mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Range officer not present' } },
      });
      fireEvent.click(await renderWith({ rangeSupervision: 'present' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'The range officer is not present, so the track officer cannot be marked present.',
      );
    });

    it('says when saving fails for another reason', async () => {
      vi.mocked(api.patchScheduledSupervisionTrack).mockRejectedValueOnce(
        new Error('network'),
      );
      fireEvent.click(await renderWith({ rangeSupervision: 'present' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'The track status could not be saved.',
      );
    });
  });
});
