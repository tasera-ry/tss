import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '@/api/api';
import { fireEvent, render, screen, within } from '@testing-library/react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { SchedulesView } from './SchedulesView';

vi.mock('@/api/api');
vi.mock('react-router-dom', async (originalImport) => {
  const actual = await originalImport();
  return {
    ...(actual as object),
    useParams: vi.fn().mockReturnValue({}),
  };
});

const FUTURE = moment().add(10, 'day').format('YYYY-MM-DD');
const PAST = moment().subtract(10, 'day').format('YYYY-MM-DD');

const day = {
  date: FUTURE,
  rangeId: 56,
  reservationId: 300,
  scheduleId: 251,
  available: true,
  open: '10:00:00',
  close: '19:00:00',
  rangeSupervisorId: 5,
  rangeSupervision: 'confirmed',
  arrivingAt: '09:45:00',
  tracks: [
    {
      id: 1,
      name: 'Rata 1',
      description: 'Pistooli',
      notice: '',
      trackSupervision: 'absent',
      scheduled: false,
    },
    {
      id: 2,
      name: 'Rata 2',
      description: null,
      notice: 'Taustavallin huolto',
      trackSupervision: 'closed',
      scheduled: { track_id: 2 },
    },
  ],
};

const sections = [
  {
    id: 11,
    track_id: 1,
    position: 1,
    lane_count: 20,
    name: 'Vasemmanpuoleisin',
    description: null,
  },
  {
    id: 12,
    track_id: 1,
    position: 2,
    lane_count: 20,
    name: 'Keskimmäinen',
    description: null,
  },
  {
    id: 21,
    track_id: 2,
    position: 1,
    lane_count: 40,
    name: 'Rata 2',
    description: null,
  },
];

const official = {
  association_id: null,
  association_name: null,
  type: 'official',
  start_time: '15:00:00',
  end_time: '17:00:00',
  lanes_used: 20,
  description: null,
};
const reservations = [
  { id: 1, ...official, track_section_id: 11 },
  { id: 2, ...official, track_section_id: 12 },
  {
    id: 3,
    track_section_id: 11,
    association_id: 5,
    association_name: 'Hirviseura',
    type: 'private_event',
    start_time: '12:00:00',
    end_time: '14:00:00',
    lanes_used: 10,
    description: 'Harjoitus',
  },
];

async function renderPage(date = FUTURE, overrides = {}) {
  vi.mocked(useParams).mockReturnValue({ date });
  vi.mocked(api.validateLogin).mockResolvedValue({} as never);
  vi.mocked(api.getSchedulingDate).mockResolvedValue({
    ...day,
    date,
    ...overrides,
  });
  vi.mocked(api.getTrackSections).mockResolvedValue(sections);
  vi.mocked(api.getTrackReservations).mockResolvedValue(reservations);
  vi.mocked(api.getAssociations).mockResolvedValue([
    { id: 5, name: 'Hirviseura' },
  ]);
  const result = render(<SchedulesView />, { wrapper: TestProviders });
  await screen.findByRole('heading', { name: 'Track 1' }, { timeout: 5000 });
  return result;
}

describe('SchedulesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the day's range details", async () => {
    await renderPage();
    const range = within(screen.getByRole('region', { name: 'Range' }));
    expect(range.getByText('Open')).toBeInTheDocument();
    expect(range.getByText('10.00–19.00')).toBeInTheDocument();
    expect(range.getByText('Hirviseura')).toBeInTheDocument();
    expect(range.getByText('Range officer confirmed')).toBeInTheDocument();
    expect(range.getByText('09.45')).toBeInTheDocument();
  });

  it('says when no range officer is assigned', async () => {
    await renderPage(FUTURE, {
      rangeSupervisorId: null,
      rangeSupervision: 'absent',
    });
    const range = within(screen.getByRole('region', { name: 'Range' }));
    expect(range.getByText('No range officer')).toBeInTheDocument();
  });

  it('marks a past day read-only, and only a past day', async () => {
    const { unmount } = await renderPage(PAST);
    expect(screen.getByTestId('past-day')).toBeInTheDocument();
    unmount();
    await renderPage(FUTURE);
    expect(screen.queryByTestId('past-day')).not.toBeInTheDocument();
  });

  it('lists official use once for the whole track, and private events per section', async () => {
    await renderPage();
    expect(screen.getAllByText('Reserved for authority use')).toHaveLength(1);
    expect(
      screen.getByText('Whole track', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('10/20')).toBeInTheDocument();
    expect(screen.getByText('Harjoitus')).toBeInTheDocument();
  });

  it("shows a track's status and the notice for the day", async () => {
    await renderPage();
    const track2 = within(screen.getByRole('region', { name: 'Track 2' }));
    expect(track2.getByDisplayValue('Taustavallin huolto')).toBeInTheDocument();
    expect(track2.getByRole('radio', { name: 'Closed' })).toBeChecked();
  });

  it('picks a date from the month calendar', async () => {
    await renderPage();
    fireEvent.click(
      screen.getByRole('button', { expanded: false, name: /\d{4}/ }),
    );
    const dialog = within(screen.getByRole('dialog', { name: 'Choose date' }));
    const target = moment(FUTURE).add(1, 'day');
    fireEvent.click(
      dialog.getByRole('button', {
        name: new Intl.DateTimeFormat('en', {
          weekday: 'long',
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        }).format(target.toDate()),
      }),
    );
    expect(window.location.hash).toBe(
      `#/schedules/${target.format('YYYY-MM-DD')}`,
    );
  });

  describe('editing a track', () => {
    const track = (name: string) =>
      within(screen.getByRole('region', { name }));

    it('saves the notice on its own, without rewriting an unchanged status', async () => {
      vi.mocked(api.patchScheduledSupervisionTrack).mockResolvedValue(
        {} as never,
      );
      await renderPage();
      fireEvent.change(track('Track 2').getByLabelText('Notice for the day'), {
        target: { value: 'Huolto klo 12 asti' },
      });
      // The day as it reloads after the save.
      vi.mocked(api.getSchedulingDate).mockResolvedValue({
        ...day,
        tracks: [
          day.tracks[0],
          { ...day.tracks[1], notice: 'Huolto klo 12 asti' },
        ],
      });
      fireEvent.click(track('Track 2').getByRole('button', { name: 'Save' }));
      await vi.waitFor(() =>
        expect(api.patchScheduledSupervisionTrack).toHaveBeenCalledWith(
          251,
          2,
          { notice: 'Huolto klo 12 asti' },
        ),
      );
      expect(await track('Track 2').findByText('Saved')).toBeInTheDocument();
    });

    it('keeps a track officer the tablet marked present when the track goes back to normal', async () => {
      vi.mocked(api.getScheduledSupervisionTrack).mockResolvedValue({
        track_supervisor: 'present',
      });
      vi.mocked(api.patchScheduledSupervisionTrack).mockResolvedValue(
        {} as never,
      );
      await renderPage();
      fireEvent.click(track('Track 2').getByRole('radio', { name: 'Normal' }));
      fireEvent.click(track('Track 2').getByRole('button', { name: 'Save' }));
      await vi.waitFor(() =>
        expect(api.patchScheduledSupervisionTrack).toHaveBeenCalledWith(
          251,
          2,
          { notice: 'Taustavallin huolto' },
        ),
      );
      expect(api.getScheduledSupervisionTrack).toHaveBeenCalledWith(251, 2);
    });

    it('asks before leaving a day with unsaved changes', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      await renderPage();
      const before = window.location.hash;
      fireEvent.change(track('Track 2').getByLabelText('Notice for the day'), {
        target: { value: 'Kesken' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Next day' }));
      expect(confirm).toHaveBeenCalled();
      expect(window.location.hash).toBe(before);
      confirm.mockRestore();
    });

    it("creates the day's rows first on a day that has none, keeping it closed", async () => {
      vi.mocked(api.createReservation).mockResolvedValue({ id: 900 });
      vi.mocked(api.createSchedule).mockResolvedValue({ id: 901 });
      vi.mocked(api.postScheduledSupervisionTrack).mockResolvedValue(
        {} as never,
      );
      await renderPage(FUTURE, {
        reservationId: null,
        scheduleId: null,
        available: null,
      });
      fireEvent.click(track('Track 1').getByRole('radio', { name: 'Closed' }));
      fireEvent.click(track('Track 1').getByRole('button', { name: 'Save' }));
      await vi.waitFor(() =>
        expect(api.postScheduledSupervisionTrack).toHaveBeenCalledWith({
          scheduled_range_supervision_id: 901,
          track_id: 1,
          track_supervisor: 'closed',
          notice: '',
        }),
      );
      expect(api.createReservation).toHaveBeenCalledWith({
        range_id: 56,
        date: FUTURE,
        available: false,
      });
      expect(api.createSchedule).toHaveBeenCalledWith({
        range_reservation_id: 900,
        open: '17:00',
        close: '20:00',
      });
    });

    it("creates the day's rows once, even before the page has reloaded the day", async () => {
      // A date of its own: the ids created here are remembered per date.
      const date = moment().add(11, 'day').format('YYYY-MM-DD');
      vi.mocked(api.createReservation).mockResolvedValue({ id: 900 });
      vi.mocked(api.createSchedule).mockResolvedValue({ id: 901 });
      vi.mocked(api.postScheduledSupervisionTrack).mockResolvedValue(
        {} as never,
      );
      await renderPage(date, {
        reservationId: null,
        scheduleId: null,
        available: null,
        tracks: [day.tracks[0], { ...day.tracks[0], id: 2, name: 'Rata 2' }],
      });
      fireEvent.click(track('Track 1').getByRole('radio', { name: 'Closed' }));
      fireEvent.click(track('Track 1').getByRole('button', { name: 'Save' }));
      await vi.waitFor(() =>
        expect(api.postScheduledSupervisionTrack).toHaveBeenCalledTimes(1),
      );
      fireEvent.click(track('Track 2').getByRole('radio', { name: 'Closed' }));
      fireEvent.click(track('Track 2').getByRole('button', { name: 'Save' }));
      await vi.waitFor(() =>
        expect(api.postScheduledSupervisionTrack).toHaveBeenLastCalledWith(
          expect.objectContaining({
            scheduled_range_supervision_id: 901,
            track_id: 2,
          }),
        ),
      );
      expect(api.createReservation).toHaveBeenCalledTimes(1);
      expect(api.createSchedule).toHaveBeenCalledTimes(1);
    });

    it('offers no editing on a past day', async () => {
      await renderPage(PAST);
      expect(
        screen.queryByLabelText('Notice for the day'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Add booking/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Edit' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('bookings', () => {
    const track1 = () =>
      within(screen.getByRole('region', { name: 'Track 1' }));

    async function openForm() {
      await renderPage();
      fireEvent.click(track1().getByRole('button', { name: /Add booking/ }));
      const form = within(screen.getByRole('form', { name: 'New booking' }));
      fireEvent.change(form.getByLabelText('Starts'), {
        target: { value: '15:00' },
      });
      fireEvent.change(form.getByLabelText('Ends'), {
        target: { value: '16:00' },
      });
      return form;
    }

    it('creates a private event on a section, with lanes and a holder', async () => {
      vi.mocked(api.createTrackReservation).mockResolvedValue([] as never);
      const form = await openForm();
      fireEvent.change(form.getByLabelText('Section'), {
        target: { value: '12' },
      });
      fireEvent.change(form.getByLabelText('Lanes'), {
        target: { value: '8' },
      });
      fireEvent.change(form.getByLabelText('Booked by'), {
        target: { value: '5' },
      });
      fireEvent.click(form.getByRole('button', { name: 'Save booking' }));
      await vi.waitFor(() =>
        expect(api.createTrackReservation).toHaveBeenCalledWith({
          date: FUTURE,
          type: 'private_event',
          start_time: '15:00',
          end_time: '16:00',
          description: null,
          track_section_id: 12,
          lanes_used: 8,
          association_id: 5,
        }),
      );
    });

    it('says how many lanes are free when the database refuses', async () => {
      vi.mocked(api.createTrackReservation).mockRejectedValue({
        response: { status: 409, data: { free: 5, total: 20 } },
      });
      const form = await openForm();
      fireEvent.change(form.getByLabelText('Lanes'), {
        target: { value: '10' },
      });
      fireEvent.click(form.getByRole('button', { name: 'Save booking' }));
      expect(await form.findByRole('alert')).toHaveTextContent(
        'Only 5/20 lanes are free at that time.',
      );
    });

    it("translates the server's reasons for refusing", async () => {
      vi.mocked(api.createTrackReservation).mockRejectedValue({
        response: { status: 400, data: { message: 'Past days are read-only' } },
      });
      const form = await openForm();
      fireEvent.change(form.getByLabelText('Lanes'), {
        target: { value: '2' },
      });
      fireEvent.click(form.getByRole('button', { name: 'Save booking' }));
      expect(await form.findByRole('alert')).toHaveTextContent(
        'Past days cannot be changed.',
      );
    });

    it('books authority use for the whole track, without lanes or a holder', async () => {
      vi.mocked(api.createTrackReservation).mockResolvedValue([] as never);
      const form = await openForm();
      fireEvent.click(
        form.getByRole('radio', { name: 'Reserved for authority use' }),
      );
      expect(form.queryByLabelText('Lanes')).not.toBeInTheDocument();
      fireEvent.click(form.getByRole('button', { name: 'Save booking' }));
      await vi.waitFor(() =>
        expect(api.createTrackReservation).toHaveBeenCalledWith({
          date: FUTURE,
          type: 'official',
          track_section_id: 11,
          start_time: '15:00',
          end_time: '16:00',
          description: null,
        }),
      );
    });

    it('deletes a booking after asking', async () => {
      vi.mocked(api.deleteTrackReservation).mockResolvedValue({} as never);
      await renderPage();
      const rows = track1().getAllByRole('listitem');
      const privateRow = within(
        rows.find((row) =>
          row.textContent?.includes('Harjoitus'),
        ) as HTMLElement,
      );
      fireEvent.click(privateRow.getByRole('button', { name: 'Delete' }));
      expect(api.deleteTrackReservation).not.toHaveBeenCalled();
      fireEvent.click(privateRow.getByRole('button', { name: 'Delete' }));
      await vi.waitFor(() =>
        expect(api.deleteTrackReservation).toHaveBeenCalledWith(3),
      );
    });

    it('says when a booking could not be deleted', async () => {
      vi.mocked(api.deleteTrackReservation).mockRejectedValue({
        response: { status: 500 },
      });
      await renderPage();
      const row = within(
        track1()
          .getAllByRole('listitem')
          .find((li) => li.textContent?.includes('Harjoitus')) as HTMLElement,
      );
      fireEvent.click(row.getByRole('button', { name: 'Delete' }));
      fireEvent.click(row.getByRole('button', { name: 'Delete' }));
      expect(await row.findByRole('alert')).toHaveTextContent(
        'The booking could not be deleted.',
      );
    });
  });
});
