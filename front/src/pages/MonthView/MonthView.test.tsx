import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '@/api/api';
import type { DaySchedule } from '@/types';
import { render, screen, waitFor } from '@testing-library/react';
import moment from 'moment';
import { HashRouter as Router, useParams } from 'react-router-dom';
import { Monthview, toMonthDay } from './MonthView';

vi.mock('axios');

// Mock the InfoBox component
vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock('@/api/api');
vi.mock('react-router-dom', async (originalImport) => {
  const originalModule = (await originalImport()) as typeof import(
    'react-router-dom',
  );
  return {
    ...originalModule,
    useParams: vi.fn().mockImplementation(() => ({
      date: undefined,
    })),
  };
});

function apiRange(
  begin: string,
  end: string,
  statusFor: (date: string) => string = () => 'closed',
) {
  const days = [];
  for (const d = moment(begin); d.isSameOrBefore(end, 'day'); d.add(1, 'day')) {
    const date = d.format('YYYY-MM-DD');
    days.push({
      date,
      rangeSupervision: statusFor(date),
      arriving_at: null,
      tracks: [],
    });
  }
  return days;
}

beforeEach(() => {
  vi.mocked(api.getSchedulingFreeform).mockImplementation(
    async (begin: string, end: string) => apiRange(begin, end),
  );
});

describe('testing monthview', () => {
  it('should render monthView when URL is broken/invalid', async () => {
    vi.setSystemTime('2020-10-21T11:30:57.000Z');
    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview />
      </Router>,
      { wrapper: TestProviders },
    );
    await waitFor(() =>
      expect(screen.getByText('October 2020')).toBeInTheDocument(),
    );
  });

  it('should render monthview when URL is valid', async () => {
    vi.mocked(useParams).mockImplementation(() => ({
      date: '2020-10-21',
    }));

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview />
      </Router>,
      { wrapper: TestProviders },
    );
    await waitFor(() =>
      expect(screen.getByText('October 2020')).toBeInTheDocument(),
    );
  });

  it('shows the visible week range and week count for the month', async () => {
    vi.mocked(useParams).mockImplementation(() => ({
      date: '2020-10-21',
    }));

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview />
      </Router>,
      { wrapper: TestProviders },
    );
    // October 2020 spans ISO weeks 40-44 (Sep 28 - Nov 1)
    await waitFor(() =>
      expect(screen.getByText('Weeks 40–44')).toBeInTheDocument(),
    );
    expect(
      await screen.findByText('5 weeks · select a day to see the tracks'),
    ).toBeInTheDocument();
  });

  it('requests the full visible range and shows statuses from the API', async () => {
    vi.mocked(useParams).mockImplementation(() => ({
      date: '2021-03-10',
    }));
    vi.mocked(api.getSchedulingFreeform).mockImplementation(
      async (begin: string, end: string) =>
        apiRange(begin, end, (date) =>
          date === '2021-03-02' ? 'present' : 'closed',
        ),
    );

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview />
      </Router>,
      { wrapper: TestProviders },
    );

    expect(
      await screen.findByRole('button', { name: '2.3. Range officer present' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '3.3. Range closed' }),
    ).toBeInTheDocument();
    // March 2021: Mon 1.3. – Sun 4.4.
    expect(api.getSchedulingFreeform).toHaveBeenCalledWith(
      '2021-03-01',
      '2021-04-04',
    );
  });
});

describe('toMonthDay', () => {
  const base = {
    date: '2021-03-02',
    rangeSupervision: 'confirmed',
    arriving_at: null,
    tracks: [],
  };

  it('falls back to the track-level arrival time like WeekView', () => {
    const day = {
      ...base,
      tracks: [
        { notice: null, scheduled: { arriving_at: null } },
        { notice: null, scheduled: { arriving_at: '17:30:00' } },
      ],
    } as unknown as DaySchedule;

    expect(toMonthDay(day)).toEqual({
      date: '2021-03-02',
      rangeSupervision: 'confirmed',
      arrivingAt: '17:30:00',
    });
  });

  it('handles days without tracks', () => {
    expect(toMonthDay(base as unknown as DaySchedule)).toMatchObject({
      arrivingAt: null,
    });
  });
});
