import { TestProviders } from '@/_TestUtils/TestProvides';
import testUtils from '@/_TestUtils/TestUtils';
import api from '@/api/api';
import { render, screen, within } from '@testing-library/react';
import { HashRouter as Router, useParams } from 'react-router-dom';
import { Dayview } from './DayView';

// Mock the InfoBox component
vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock('@/api/api');
vi.mock('react-router-dom', async (originalImport) => {
  const originalModule = await originalImport();
  return {
    ...(originalModule as object),
    useParams: vi.fn().mockImplementation(() => ({
      date: undefined,
    })),
  };
});

const { schedule } = testUtils;

/**
 * LinguiProvider renders null until its catalog import resolves, so each test
 * awaits the first track card once, then asserts synchronously.
 */
async function renderDayview(day: Record<string, unknown> = schedule) {
  vi.mocked(api.getSchedulingDate).mockResolvedValue(day);
  vi.mocked(api.getAllDevices).mockResolvedValue([]);
  localStorage.setItem('language', '1');
  const result = render(
    <Router>
      <Dayview />
    </Router>,
    { wrapper: TestProviders },
  );
  await screen.findByRole(
    'link',
    { name: /Shooting Track 0/ },
    { timeout: 5000 },
  );
  return result;
}

/** One day, with the range officer and each track's officer as given. */
function dayWith(
  rangeSupervision: string,
  trackSupervision: string[],
  extra: Record<string, unknown> = {},
) {
  return {
    ...schedule,
    open: '10:00:00',
    close: '19:00:00',
    rangeSupervision,
    arrivingAt: null,
    ...extra,
    tracks: schedule.tracks.map((track, i) => ({
      ...track,
      trackSupervision: trackSupervision[i] ?? 'absent',
    })),
  };
}

function card(name: string) {
  return within(screen.getByRole('link', { name: new RegExp(`${name}\\b`) }));
}

describe('testing Dayview component', () => {
  it('should render Dayview', async () => {
    await renderDayview();
    expect(
      screen.getByRole('link', { name: /Shooting Track 0/ }),
    ).toBeInTheDocument();
  });

  it('should show range officer status', async () => {
    await renderDayview();
    expect(screen.getByText('Range closed')).toBeInTheDocument();
  });

  it('should show the correct date from search params', async () => {
    vi.mocked(useParams).mockImplementation(() => ({
      date: '2020-10-21',
    }));
    await renderDayview();
    expect(screen.getByText('Wednesday, 10/21/2020')).toBeInTheDocument();
  });

  it('should render the mocked InfoBox component', async () => {
    await renderDayview();
    expect(screen.getByTestId('mockInfoBox')).toBeInTheDocument();
  });

  describe('track cards', () => {
    it('are not open while the range officer is away, and say why', async () => {
      // Customer, 8.10.2026: no range officer on site, no track can be open.
      await renderDayview(dayWith('absent', ['present', 'present']));
      expect(card('Shooting Track 0').queryByText('Open')).toBeNull();
      expect(
        card('Shooting Track 0').getByText('No range officer present'),
      ).toBeInTheDocument();
    });

    it('keep the track 6 exception: it opens with its own officer alone', async () => {
      // Pasi Autio, 12.10.2026. The sixth track in the list, as in the track view.
      await renderDayview(
        dayWith('absent', [
          'absent',
          'absent',
          'absent',
          'absent',
          'absent',
          'present',
        ]),
      );
      expect(card('Shooting Track 5').getByText('Open')).toBeInTheDocument();
    });

    it('are open when both officers are present', async () => {
      await renderDayview(dayWith('present', ['present']));
      expect(card('Shooting Track 0').getByText('Open')).toBeInTheDocument();
    });

    it('name a missing track officer', async () => {
      await renderDayview(dayWith('present', ['absent']));
      expect(
        card('Shooting Track 0').getByText('No track officer present'),
      ).toBeInTheDocument();
    });

    it('show a closed track as closed', async () => {
      await renderDayview(dayWith('present', ['closed']));
      expect(card('Shooting Track 0').getByText('Closed')).toBeInTheDocument();
    });

    it('show a private event track as a private event (#451)', async () => {
      await renderDayview(dayWith('present', ['private_event']));
      expect(
        card('Shooting Track 0').getByText('Private event'),
      ).toBeInTheDocument();
    });

    it('say when the track opens once a confirmed range officer has given an arrival time', async () => {
      await renderDayview(
        dayWith('confirmed', ['present'], { arrivingAt: '10:30:00' }),
      );
      expect(
        card('Shooting Track 0').getByText('Opens at 10.30'),
      ).toBeInTheDocument();
      expect(card('Shooting Track 0').queryByText('Open')).toBeNull();
    });

    it('never open before opening time, even if the range officer arrives early', async () => {
      await renderDayview(
        dayWith('confirmed', ['present'], { arrivingAt: '09:45:00' }),
      );
      expect(
        card('Shooting Track 0').getByText('Opens at 10.00'),
      ).toBeInTheDocument();
    });

    it('wait for the range officer when no arrival time is known', async () => {
      await renderDayview(dayWith('not confirmed', ['present']));
      expect(
        card('Shooting Track 0').getByText('Awaiting range officer'),
      ).toBeInTheDocument();
    });
  });

  describe('agree with the track view (review of #478)', () => {
    it('on a booked day, a track officer not yet marked does not hide the opening time', async () => {
      // Production: booked future days carry every track officer as 'absent'.
      await renderDayview(
        dayWith('confirmed', ['absent'], { arrivingAt: '10:30:00' }),
      );
      expect(
        card('Shooting Track 0').getByText('Opens at 10.30'),
      ).toBeInTheDocument();
    });

    it('track 6 still needs its own officer on a booked day', async () => {
      await renderDayview(
        dayWith('confirmed', ['present'], { arrivingAt: '10:30:00' }),
      );
      expect(
        card('Shooting Track 5').getByText('No track officer present'),
      ).toBeInTheDocument();
    });

    it('a range closed for the day closes track 6 too', async () => {
      await renderDayview(
        dayWith('closed', [
          'present',
          'present',
          'present',
          'present',
          'present',
          'present',
        ]),
      );
      expect(card('Shooting Track 5').getByText('Closed')).toBeInTheDocument();
    });

    it('an arrival at or after closing time waits instead of promising an opening', async () => {
      await renderDayview(
        dayWith('confirmed', ['present'], { arrivingAt: '19:00:00' }),
      );
      expect(
        card('Shooting Track 0').getByText('Awaiting range officer'),
      ).toBeInTheDocument();
    });
  });

  it('does not show an old arrival time once the range officer is present', async () => {
    await renderDayview(
      dayWith('present', ['present'], { arrivingAt: '09:45:00' }),
    );
    expect(screen.queryByText(/Range officer arriving at/)).toBeNull();
  });

  it('writes the opening hours as hh.mm', async () => {
    await renderDayview(
      dayWith('present', ['present'], { open: '09:30:00', close: '15:00:00' }),
    );
    expect(screen.getByText('09.30–15.00')).toBeInTheDocument();
  });

  it('names the numbered tracks in the interface language', async () => {
    const day = dayWith('present', ['present']);
    await renderDayview({
      ...day,
      tracks: day.tracks.map((track, i) =>
        i === 1 ? { ...track, name: 'Rata 2' } : track,
      ),
    });
    expect(screen.getByRole('link', { name: /Track 2/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/trackview\/.*\/Rata(%20| )2$/),
    );
  });

  it('shows the range officer arrival time in the banner', async () => {
    await renderDayview(
      dayWith('confirmed', ['present'], { arrivingAt: '09:45:00' }),
    );
    expect(
      screen.getByText('Range officer arriving at 09.45'),
    ).toBeInTheDocument();
  });
});
