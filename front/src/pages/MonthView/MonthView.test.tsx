import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '@/api/api';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import moment from 'moment';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter as Router, useParams } from 'react-router-dom';
import { Monthview } from './MonthView';

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

interface ApiDayOverrides {
  rangeSupervision?: string;
  arriving_at?: string | null;
}

function apiRange(
  begin: string,
  end: string,
  dayFor: (date: string) => ApiDayOverrides | null = () => ({}),
) {
  const days = [];
  for (const d = moment(begin); d.isSameOrBefore(end, 'day'); d.add(1, 'day')) {
    const date = d.format('YYYY-MM-DD');
    const overrides = dayFor(date);
    if (overrides === null) continue;
    days.push({
      date,
      rangeSupervision: 'closed',
      arriving_at: null,
      tracks: [],
      ...overrides,
    });
  }
  return days;
}

function setDateParam(date: string | undefined) {
  vi.mocked(useParams).mockImplementation(() => ({ date }));
}

function setDesktop(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function monthviewTree(
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) {
  return (
    <QueryClientProvider client={client}>
      <Router>
        <Monthview />
      </Router>
    </QueryClientProvider>
  );
}

function renderMonthview() {
  return render(monthviewTree(), { wrapper: TestProviders });
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  localStorage.setItem('language', '1');
  window.location.hash = '';
  setDateParam(undefined);
  vi.mocked(api.getSchedulingFreeform).mockImplementation(
    async (begin: string, end: string) => apiRange(begin, end),
  );
});

afterEach(() => {
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

describe('testing monthview', () => {
  it('shows the current month when no date is given', async () => {
    vi.setSystemTime('2020-10-21T11:30:57.000Z');
    renderMonthview();
    await waitFor(() =>
      expect(screen.getByText('October 2020')).toBeInTheDocument(),
    );
  });

  it('should render monthview when URL is valid', async () => {
    setDateParam('2020-10-21');
    renderMonthview();
    await waitFor(() =>
      expect(screen.getByText('October 2020')).toBeInTheDocument(),
    );
  });

  it('falls back to today and fixes the URL when the date is invalid', async () => {
    vi.setSystemTime('2020-10-21T11:30:57.000Z');
    setDateParam('not-a-date');
    renderMonthview();

    expect(await screen.findByText('October 2020')).toBeInTheDocument();
    await waitFor(() =>
      expect(window.location.hash).toBe('#/monthview/2020-10-21'),
    );
    expect(api.getSchedulingFreeform).toHaveBeenCalledWith(
      '2020-09-28',
      '2020-11-01',
    );
  });

  it('shows the visible week numbers and week count for the month', async () => {
    setDateParam('2020-10-21');
    renderMonthview();
    // October 2020 spans ISO weeks 40-44 (Sep 28 - Nov 1)
    await waitFor(() => expect(screen.getByText('40')).toBeInTheDocument());
    expect(screen.getByText('44')).toBeInTheDocument();
    expect(
      await screen.findByText('5 weeks · select a day to see the tracks'),
    ).toBeInTheDocument();
  });

  it('numbers the weeks across a year boundary', async () => {
    setDateParam('2021-01-15');
    renderMonthview();
    // January 2021: Mon 28.12.2020 (week 53) – Sun 31.1.2021 (week 4)
    expect(await screen.findByText('53')).toBeInTheDocument();
  });

  it('requests the full visible range and shows statuses from the API', async () => {
    setDateParam('2021-03-10');
    vi.mocked(api.getSchedulingFreeform).mockImplementation(
      async (begin: string, end: string) =>
        apiRange(begin, end, (date) =>
          date === '2021-03-02' ? { rangeSupervision: 'present' } : {},
        ),
    );
    renderMonthview();

    expect(
      await screen.findByRole('button', {
        name: 'Tuesday, March 2, Range officer present',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Wednesday, March 3, Range closed' }),
    ).toBeInTheDocument();
    // March 2021: Mon 1.3. – Sun 4.4.
    expect(api.getSchedulingFreeform).toHaveBeenCalledWith(
      '2021-03-01',
      '2021-04-04',
    );
  });

  it('keeps a full grid when the API leaves out a day', async () => {
    setDateParam('2021-03-10');
    vi.mocked(api.getSchedulingFreeform).mockImplementation(
      async (begin: string, end: string) =>
        apiRange(begin, end, (date) => (date === '2021-03-10' ? null : {})),
    );
    const { container } = renderMonthview();

    expect(
      await screen.findByRole('button', {
        name: 'Wednesday, March 10, Range officer undefined',
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-date]')).toHaveLength(35);
  });

  it('disables the days while the month is loading', async () => {
    setDateParam('2021-03-10');
    const pending = new Map<string, (value: unknown) => void>();
    vi.mocked(api.getSchedulingFreeform).mockImplementation(
      (begin: string) => new Promise((r) => pending.set(begin, r)),
    );
    const { container } = renderMonthview();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-date]')).toHaveLength(35),
    );
    const cells = container.querySelectorAll('[data-date]');
    for (const cell of cells) expect(cell).toBeDisabled();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();

    pending.get('2021-03-01')?.(apiRange('2021-03-01', '2021-04-04'));
    expect(
      await screen.findByRole('button', {
        name: 'Wednesday, March 3, Range closed',
      }),
    ).toBeEnabled();
  });

  it('shows an error with a retry button when loading fails', async () => {
    setDateParam('2021-03-10');
    vi.mocked(api.getSchedulingFreeform).mockRejectedValueOnce(
      new Error('network'),
    );
    renderMonthview();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the schedule.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('button', {
        name: 'Wednesday, March 3, Range closed',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('moves to the next month', async () => {
    setDateParam('2021-03-10');
    renderMonthview();
    await screen.findByText('March 2021');

    fireEvent.click(screen.getByTestId('nextDay'));
    expect(window.location.hash).toBe('#/monthview/2021-04-10');
  });

  it('does not refetch prefetched neighbours but refetches the visible month', async () => {
    setDateParam('2021-03-10');
    vi.mocked(api.getSchedulingFreeform).mockClear();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { rerender } = render(monthviewTree(client), {
      wrapper: TestProviders,
    });
    await screen.findByText('March 2021');
    await waitFor(() =>
      expect(api.getSchedulingFreeform).toHaveBeenCalledTimes(3),
    );

    setDateParam('2021-04-10');
    rerender(monthviewTree(client));
    await screen.findByText('April 2021');
    // April refetches once; May (new neighbour) is prefetched; March stays cached.
    await waitFor(() =>
      expect(api.getSchedulingFreeform).toHaveBeenCalledTimes(5),
    );
    expect(api.getSchedulingFreeform).toHaveBeenCalledWith(
      '2021-04-26',
      '2021-06-06',
    );
  });

  it('moves focus between days with the arrow keys', async () => {
    setDateParam('2021-03-10');
    renderMonthview();

    const day = await screen.findByRole('button', {
      name: 'Wednesday, March 10, Range closed',
    });
    day.focus();
    fireEvent.keyDown(day, { key: 'ArrowRight' });
    expect(document.activeElement).toHaveAttribute('data-date', '2021-03-11');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveAttribute('data-date', '2021-03-04');
  });

  it('gives the calendar one Tab stop, which follows the focused day', async () => {
    setDateParam('2021-03-10');
    const { container } = renderMonthview();
    const tabStops = () =>
      [...container.querySelectorAll('[data-date][tabindex="0"]')].map((cell) =>
        cell.getAttribute('data-date'),
      );

    const day = await screen.findByRole('button', {
      name: 'Wednesday, March 10, Range closed',
    });
    expect(tabStops()).toEqual(['2021-03-10']);

    day.focus();
    fireEvent.keyDown(day, { key: 'ArrowRight' });
    expect(tabStops()).toEqual(['2021-03-11']);
  });

  it('leaves arrow keys with a modifier to the browser', async () => {
    setDateParam('2021-03-10');
    renderMonthview();

    const day = await screen.findByRole('button', {
      name: 'Wednesday, March 10, Range closed',
    });
    day.focus();
    const hash = window.location.hash;
    // Alt+Left is the browser's Back.
    fireEvent.keyDown(day, { key: 'ArrowLeft', altKey: true });
    expect(document.activeElement).toBe(day);
    expect(window.location.hash).toBe(hash);
  });

  it('moves to the next month when the arrow keys leave the grid', async () => {
    setDateParam('2021-03-10');
    const { rerender } = renderMonthview();

    const day = await screen.findByRole('button', {
      name: /^Monday, March 29/,
    });
    day.focus();
    fireEvent.keyDown(day, { key: 'ArrowDown' });
    expect(window.location.hash).toBe('#/monthview/2021-04-05');

    setDateParam('2021-04-05');
    rerender(monthviewTree());
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-date', '2021-04-05'),
    );
  });

  describe('on mobile', () => {
    it("hides the arrival time in today's cell", async () => {
      const today = moment().format('YYYY-MM-DD');
      vi.mocked(api.getSchedulingFreeform).mockImplementation(
        async (begin: string, end: string) =>
          apiRange(begin, end, (date) =>
            date === today
              ? { rangeSupervision: 'confirmed', arriving_at: '17:30:00' }
              : {},
          ),
      );
      renderMonthview();

      const cell = await screen.findByRole('button', {
        name: /Today, Range officer confirmed, Estimate 17:30$/,
      });
      expect(cell).toHaveTextContent('TODAY');
      expect(cell).not.toHaveTextContent('17:30');
    });

    it('selects a day and shows its details', async () => {
      setDateParam('2021-03-10');
      vi.mocked(api.getSchedulingFreeform).mockImplementation(
        async (begin: string, end: string) =>
          apiRange(begin, end, (date) =>
            date === '2021-03-12'
              ? { rangeSupervision: 'confirmed', arriving_at: '17:30:00' }
              : {},
          ),
      );
      renderMonthview();

      const day = await screen.findByRole('button', {
        name: 'Friday, March 12, Range officer confirmed, Estimate 17:30',
      });
      expect(day).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(day);

      expect(day).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('heading', { level: 2, name: 'Friday, 3/12/2021' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: 'Legend' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Estimated arrival 17:30')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Open day view' }),
      ).toHaveAttribute('href', '#/dayview/2021-03-12');
      expect(window.location.hash).not.toContain('dayview');
    });

    it('does not show an arrival estimate once the officer is present', async () => {
      setDateParam('2021-03-10');
      vi.mocked(api.getSchedulingFreeform).mockImplementation(
        async (begin: string, end: string) =>
          apiRange(begin, end, () => ({
            rangeSupervision: 'present',
            arriving_at: '17:30:00',
          })),
      );
      renderMonthview();

      const card = (
        await screen.findByRole('heading', { name: 'Wednesday, 3/10/2021' })
      ).parentElement?.parentElement as HTMLElement;
      expect(
        within(card).getByText('Range officer present'),
      ).toBeInTheDocument();
      expect(within(card).queryByText(/arrival/i)).not.toBeInTheDocument();
    });

    it('does not show an arrival time for an unconfirmed officer', async () => {
      setDateParam('2021-03-10');
      vi.mocked(api.getSchedulingFreeform).mockImplementation(
        async (begin: string, end: string) =>
          apiRange(begin, end, () => ({ rangeSupervision: 'not confirmed' })),
      );
      renderMonthview();

      const card = (
        await screen.findByRole('heading', { name: 'Wednesday, 3/10/2021' })
      ).parentElement?.parentElement as HTMLElement;
      expect(
        within(card).getByText('Range officer predefined, not confirmed'),
      ).toBeInTheDocument();
      expect(within(card).queryByText(/arrival/i)).not.toBeInTheDocument();
    });

    it('selects a day of the next month shown in the grid', async () => {
      setDateParam('2021-03-10');
      vi.mocked(api.getSchedulingFreeform).mockImplementation(
        async (begin: string, end: string) =>
          apiRange(begin, end, (date) =>
            date === '2021-04-01' ? { rangeSupervision: 'present' } : {},
          ),
      );
      renderMonthview();

      fireEvent.click(
        await screen.findByRole('button', { name: 'Thursday, April 1' }),
      );

      const card = screen.getByRole('heading', { name: 'Thursday, 4/1/2021' })
        .parentElement?.parentElement as HTMLElement;
      expect(
        within(card).getByText('Range officer present'),
      ).toBeInTheDocument();
      expect(
        within(card).getByRole('link', { name: 'Open day view' }),
      ).toHaveAttribute('href', '#/dayview/2021-04-01');
    });
  });

  describe('on desktop', () => {
    it('links each day to its day view', async () => {
      setDesktop(true);
      setDateParam('2021-03-10');
      renderMonthview();

      const day = await screen.findByRole('link', {
        name: 'Friday, March 12, Range closed',
      });
      expect(day).toHaveAttribute('href', '#/dayview/2021-03-12');
      fireEvent.click(day);

      expect(window.location.hash).toBe('#/dayview/2021-03-12');
    });

    it('shows the arrival time in the cell', async () => {
      setDesktop(true);
      setDateParam('2021-03-10');
      vi.mocked(api.getSchedulingFreeform).mockImplementation(
        async (begin: string, end: string) =>
          apiRange(begin, end, (date) => {
            if (date === '2021-03-12')
              return { rangeSupervision: 'confirmed', arriving_at: '17:30:00' };
            if (date === '2021-03-13') return { rangeSupervision: 'confirmed' };
            return {};
          }),
      );
      renderMonthview();

      const withTime = await screen.findByRole('link', {
        name: /^Friday, March 12/,
      });
      expect(withTime).toHaveTextContent('Estimate 17:30');
      expect(
        screen.getByRole('link', { name: /^Saturday, March 13/ }),
      ).toHaveTextContent('Arrival time unknown');
    });
  });
});
