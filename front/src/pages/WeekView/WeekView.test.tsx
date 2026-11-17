import { TestProviders } from '@/_TestUtils/TestProvides';
import { schedulingWeek } from '@/_TestUtils/TestUtils';
import type { DaySchedule } from '@/types';
import { getSchedulingWeek } from '@/utils/Utils';
import { render, screen, waitFor } from '@testing-library/react';
import moment from 'moment';
import { act } from 'react-dom/test-utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route } from 'react-router-dom';
import { Weekview, formatWeekRange } from './WeekView';

vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock(import('@/utils/Utils'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getSchedulingWeek: vi.fn(),
  };
});

type SchedulingWeek = Awaited<ReturnType<typeof getSchedulingWeek>>;

const statuses = [
  'present',
  'confirmed',
  'not confirmed',
  'absent',
  'closed',
  'confirmed',
  'present',
];

function buildWeek(
  monday: string,
  overrides: (day: DaySchedule) => Partial<DaySchedule> = () => ({}),
) {
  return {
    ...schedulingWeek,
    week: schedulingWeek.week.map((day, i) => {
      const next = {
        ...day,
        date: moment(monday).add(i, 'day').format('YYYY-MM-DD'),
        rangeSupervision: statuses[i],
        arriving_at: null,
        tracks: day.tracks.map((track) => ({
          ...track,
          notice: null,
          scheduled: { ...track.scheduled, arriving_at: null },
        })),
      };
      return { ...next, ...overrides(next as unknown as DaySchedule) };
    }),
  } as unknown as SchedulingWeek;
}

async function renderAt(date: string) {
  await act(async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/weekview/${date}`]}>
          <Route path="/weekview/:date?" component={Weekview} />
        </MemoryRouter>
      </QueryClientProvider>,
      { wrapper: TestProviders },
    );
  });
}

describe('Weekview', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders one card per weekday with its status', async () => {
    vi.mocked(getSchedulingWeek).mockResolvedValue(buildWeek('2026-10-12'));
    await renderAt('2026-10-14');

    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /2026/ })).toHaveLength(7),
    );
    expect(screen.getAllByText('Range officer present')).toHaveLength(2);
    expect(screen.getByText('Range closed')).toBeInTheDocument();
    expect(
      screen.getByText('Range officer predefined, not confirmed'),
    ).toBeInTheDocument();
    expect(screen.getByText('Range officer undefined')).toBeInTheDocument();
    expect(screen.getByText('12.10.2026')).toBeInTheDocument();
    expect(screen.getByText('18.10.2026')).toBeInTheDocument();
    expect(screen.getByText('12.–18.10.2026')).toBeInTheDocument();
    expect(screen.getByTestId('mockInfoBox')).toBeInTheDocument();
  });

  it('links each day to its day view', async () => {
    vi.mocked(getSchedulingWeek).mockResolvedValue(buildWeek('2026-10-12'));
    await renderAt('2026-10-14');

    const links = await screen.findAllByRole('link', { name: /2026/ });
    expect(links[0]).toHaveAttribute('href', '/dayview/2026-10-12');
    expect(links[6]).toHaveAttribute('href', '/dayview/2026-10-18');
  });

  it('shows the arrival estimate for confirmed days', async () => {
    vi.mocked(getSchedulingWeek).mockResolvedValue(
      buildWeek('2026-10-12', (day) =>
        day.date === '2026-10-13' ? { arriving_at: '17:30:00' } : {},
      ),
    );
    await renderAt('2026-10-14');

    expect(await screen.findByText('Estimate 17.30')).toBeInTheDocument();
    expect(screen.getByText('Arrival time unknown')).toBeInTheDocument();
  });

  it('marks today and days with track notices', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-15T12:00:00'));
    vi.mocked(getSchedulingWeek).mockResolvedValue(
      buildWeek('2026-10-12', (day) =>
        day.date === '2026-10-17'
          ? {
              tracks: day.tracks.map((t) => ({
                ...t,
                notice: 'Kilpailu',
              })),
            }
          : {},
      ),
    );
    await renderAt('2026-10-15');

    const links = await screen.findAllByRole('link', { name: /2026/ });
    expect(links[3]).toHaveAttribute('aria-current', 'date');
    expect(links.filter((l) => l.hasAttribute('aria-current'))).toHaveLength(1);
    expect(screen.getByText('TODAY')).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Track has additional information'),
    ).toHaveLength(1);
  });

  it('shows an error when the schedule cannot be loaded', async () => {
    vi.mocked(getSchedulingWeek).mockRejectedValue(new Error('boom'));
    await renderAt('2026-10-14');

    expect(
      await screen.findByText(
        'Could not load the schedule. Please try again later.',
      ),
    ).toBeInTheDocument();
  });
});

describe('formatWeekRange', () => {
  it('formats a week inside one month', () => {
    expect(formatWeekRange('2026-10-14')).toBe('12.–18.10.2026');
  });

  it('formats a week spanning two months', () => {
    expect(formatWeekRange('2026-10-01')).toBe('28.9.–4.10.2026');
  });

  it('formats a week spanning two years', () => {
    expect(formatWeekRange('2026-12-31')).toBe('28.12.2026–3.1.2027');
  });
});
