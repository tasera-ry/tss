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
    },
    {
      id: 2,
      name: 'Rata 2',
      description: null,
      notice: 'Taustavallin huolto',
      trackSupervision: 'closed',
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
    expect(screen.getByText('Taustavallin huolto')).toBeInTheDocument();
    expect(screen.getAllByText('Closed').length).toBeGreaterThan(0);
  });

  it('picks a date from the month calendar', async () => {
    await renderPage();
    fireEvent.click(
      screen.getByRole('button', { expanded: false, name: /\d{4}/ }),
    );
    const dialog = within(
      screen.getByRole('dialog', { name: 'Choose a date' }),
    );
    const target = moment(FUTURE).add(1, 'day');
    fireEvent.click(
      dialog.getByRole('button', { name: target.format('dddd D.M.YYYY') }),
    );
    expect(window.location.hash).toBe(
      `#/schedules/${target.format('YYYY-MM-DD')}`,
    );
  });
});
