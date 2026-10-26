import { TestProviders } from '@/_TestUtils/TestProvides';
import { render, screen, within } from '@testing-library/react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import testUtils from '../_TestUtils/TestUtils';
import api from '../api/api';
import { Trackview } from './Trackview';

vi.mock('../api/api');
vi.mock('react-router-dom', async (originalImport) => {
  const actual = await originalImport();
  return {
    ...(actual as any),
    useParams: vi.fn().mockReturnValue({
      date: '2020-02-20',
      track: 'Shooting Track 0',
    }),
  };
});

/**
 * LinguiProvider renders null until its catalog import resolves, and this version
 * of Testing Library does not reliably settle a second `findBy*` afterwards. So
 * each test awaits the track's heading once, then asserts synchronously.
 */
async function renderTrackview(schedule = testUtils.schedule) {
  vi.mocked(api.getSchedulingDate).mockResolvedValue(schedule);
  const result = render(<Trackview />, { wrapper: TestProviders });
  await screen.findByRole(
    'heading',
    { level: 2, name: 'Shooting Track 0' },
    { timeout: 5000 },
  );
  return result;
}

describe('testing Trackview', () => {
  it('should render Trackview', async () => {
    await renderTrackview();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Shooting Track 0' }),
    ).toBeInTheDocument();
  });

  describe('navigation', () => {
    it('links to the previous and next day on the same track', async () => {
      await renderTrackview();

      expect(
        screen.getByRole('link', { name: 'Previous day' }),
      ).toHaveAttribute(
        'href',
        expect.stringMatching(
          /\/trackview\/2020-02-19\/Shooting(%20| )Track(%20| )0$/,
        ),
      );
      expect(screen.getByRole('link', { name: 'Next day' })).toHaveAttribute(
        'href',
        expect.stringMatching(
          /\/trackview\/2020-02-21\/Shooting(%20| )Track(%20| )0$/,
        ),
      );
    });

    it('links to every other track on the same day, and marks the current one', async () => {
      await renderTrackview();

      const tracks = within(screen.getByRole('navigation', { name: 'Tracks' }));
      expect(tracks.getAllByRole('link')).toHaveLength(
        testUtils.schedule.tracks.length - 1,
      );
      expect(
        tracks.getByRole('link', { name: 'Shooting Track 1' }),
      ).toHaveAttribute(
        'href',
        expect.stringMatching(
          /\/trackview\/2020-02-20\/Shooting(%20| )Track(%20| )1$/,
        ),
      );
      expect(tracks.getByText('Shooting Track 0')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('links to the month, week and day views for the same date', async () => {
      await renderTrackview();

      const views = within(screen.getByRole('navigation', { name: 'Views' }));
      expect(views.getByRole('link', { name: 'Month' })).toHaveAttribute(
        'href',
        expect.stringMatching(/\/monthview\/2020-02-20$/),
      );
      expect(views.getByRole('link', { name: 'Week' })).toHaveAttribute(
        'href',
        expect.stringMatching(/\/weekview\/2020-02-20$/),
      );
      expect(views.getByRole('link', { name: 'Day' })).toHaveAttribute(
        'href',
        expect.stringMatching(/\/dayview\/2020-02-20$/),
      );
      expect(views.getByText('Track')).toHaveAttribute('aria-current', 'page');
    });

    it('defaults to today when the route has no date', async () => {
      // /trackview/:date? — without this the tabs would link to /monthview/undefined.
      vi.mocked(useParams).mockReturnValue({ track: 'Shooting Track 0' });
      try {
        await renderTrackview();
        const today = moment().format('YYYY-MM-DD');
        const views = within(screen.getByRole('navigation', { name: 'Views' }));
        expect(views.getByRole('link', { name: 'Month' })).toHaveAttribute(
          'href',
          expect.stringMatching(new RegExp(`/monthview/${today}$`)),
        );
      } finally {
        vi.mocked(useParams).mockReturnValue({
          date: '2020-02-20',
          track: 'Shooting Track 0',
        });
      }
    });
  });

  it('reports that no track can be used when the range officer is away', async () => {
    // The shared fixture carries rangeSupervision 'closed' while individual
    // tracks carry trackSupervision 'present' — the combination the customer
    // says cannot occur. The view has to resolve it in the member's favour by
    // reporting the range officer rather than showing the track as usable.
    await renderTrackview();

    // Appears both in the banner and beside every blocked stretch of time.
    expect(
      screen.getAllByText('No range officer present').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText('No track can be used until the range officer arrives.'),
    ).toBeInTheDocument();
  });

  it('marks free time as unavailable rather than free while the range is unsupervised', async () => {
    await renderTrackview();

    expect(screen.getAllByText('No shooting').length).toBeGreaterThan(0);
    expect(screen.queryByText('Free')).not.toBeInTheDocument();
  });

  it('names the reason beside each unavailable stretch of time', async () => {
    await renderTrackview();

    // The reason is written out, never left to colour or to a hover.
    expect(
      screen.getAllByText('No range officer present').length,
    ).toBeGreaterThan(1);
  });

  it('lists the three lohkot of the pistol track separately', async () => {
    await renderTrackview();

    expect(screen.getAllByText('Lohko 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lohko 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lohko 3').length).toBeGreaterThan(0);
  });

  it('says where each lohko is', async () => {
    await renderTrackview();

    expect(screen.getByText('Vasemmanpuoleisin loossi')).toBeInTheDocument();
    expect(screen.getByText('Keskimmäinen loossi')).toBeInTheDocument();
    expect(screen.getByText('Oikeanpuoleisin loossi')).toBeInTheDocument();
  });

  it('labels the notice as the notice for the day', async () => {
    await renderTrackview();

    expect(screen.getByText('Notice for the day')).toBeInTheDocument();
  });

  describe('with both supervisors present', () => {
    // The placeholder books half of Lohko 1 for a club on this fixture.
    const supervised = {
      ...testUtils.schedule,
      rangeSupervision: 'present',
      tracks: testUtils.schedule.tracks.map((track, i) =>
        i === 0 ? { ...track, trackSupervision: 'present' } : track,
      ),
    };

    it('shows a part-booked stretch as partly available, with the booking named', async () => {
      await renderTrackview(supervised);

      expect(screen.getAllByText('Partially available').length).toBeGreaterThan(
        0,
      );
      expect(
        screen.getByText(
          'Private event · Varattu seuran vuorolle · 10 lanes booked',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('10/20 free')).toBeInTheDocument();
    });

    it('counts free lanes on the bar, the same figure as the list', async () => {
      await renderTrackview(supervised);

      const bar = within(screen.getByTestId('timeline'));
      expect(bar.getByText('Partially available')).toBeInTheDocument();
      expect(bar.getByText('10/20')).toBeInTheDocument();
    });
  });

  describe('on a day whose range officer is booked but not on site yet', () => {
    // How every future day looks: 'present' is only set at the range. Review of #453.
    const booked = (rangeSupervision: string) => ({
      ...testUtils.schedule,
      rangeSupervision,
      tracks: testUtils.schedule.tracks.map((track, i) =>
        i === 0 ? { ...track, trackSupervision: 'present' } : track,
      ),
    });

    it('shows free time as free, and says the range officer is confirmed', async () => {
      await renderTrackview(booked('confirmed'));

      expect(screen.queryByText('No shooting')).not.toBeInTheDocument();
      expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
      const banner = within(screen.getByTestId('range-officer-banner'));
      expect(banner.getByText('Range officer confirmed')).toBeInTheDocument();
      expect(
        banner.getByText('Tracks can be used once the range officer arrives.'),
      ).toBeInTheDocument();
      // Beside each free stretch too, so the reason is never only in the banner.
      expect(
        screen.getAllByText('Range officer confirmed').length,
      ).toBeGreaterThan(1);
    });

    it('says so when the range officer is not confirmed yet', async () => {
      await renderTrackview(booked('not confirmed'));

      expect(screen.queryByText('No shooting')).not.toBeInTheDocument();
      expect(
        screen.getAllByText('Range officer predefined').length,
      ).toBeGreaterThan(1);
    });
  });

  it('offers no free lanes on a part-booked stretch while a supervisor is missing', async () => {
    await renderTrackview();

    expect(screen.queryByText('Partially available')).not.toBeInTheDocument();
    expect(screen.queryByText('10/20 free')).not.toBeInTheDocument();
    // The bar draws the booking whole, so nothing below it reads as open.
    const bar = within(screen.getByTestId('timeline'));
    expect(bar.queryByText('10/20')).not.toBeInTheDocument();
    expect(bar.getAllByText('Private event').length).toBeGreaterThan(0);
  });

  it('offers no free lanes while the track officer alone is missing', async () => {
    await renderTrackview({
      ...testUtils.schedule,
      rangeSupervision: 'present',
    });

    expect(screen.queryByText('Partially available')).not.toBeInTheDocument();
    expect(
      screen.getAllByText('No track officer present').length,
    ).toBeGreaterThan(1);
  });
});
