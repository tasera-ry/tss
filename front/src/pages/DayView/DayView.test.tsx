import { TestProviders } from '@/_TestUtils/TestProvides';
import testUtils from '@/_TestUtils/TestUtils';
import api from '@/api/api';
import { render, screen, waitFor } from '@testing-library/react';
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
    ...originalModule,
    useParams: vi.fn().mockImplementation(() => ({
      date: undefined,
    })),
  };
});

const { schedule } = testUtils;

describe('testing Dayview component', () => {
  it('should render Dayview', async () => {
    vi.mocked(api.getSchedulingDate).mockResolvedValue(schedule);
    localStorage.setItem('language', '1');

    render(
      <Router>
        <Dayview />
      </Router>,
      { wrapper: TestProviders },
    );
    await waitFor(() =>
      expect(screen.getByText('Back to weekview')).toBeInTheDocument(),
    );
  });

  it('should show range officer status', async () => {
    vi.mocked(api.getSchedulingDate).mockResolvedValue(schedule);
    localStorage.setItem('language', '1');

    render(
      <Router>
        <Dayview />
      </Router>,
      { wrapper: TestProviders },
    );
    await waitFor(() =>
      expect(screen.getByText('Range closed')).toBeInTheDocument(),
    );
  });

  it('should show the correct date from search params', async () => {
    vi.mocked(api.getSchedulingDate).mockResolvedValue(schedule);
    localStorage.setItem('language', '1');
    vi.mocked(useParams).mockImplementation(() => ({
      date: '2020-10-21',
    }));
    render(
      <Router>
        <Dayview />
      </Router>,
      { wrapper: TestProviders },
    );
    await waitFor(() =>
      expect(screen.getByText('Wednesday, 10/21/2020')).toBeInTheDocument(),
    );
  });

  it('should render the mocked InfoBox component', async () => {
    vi.mocked(api.getSchedulingDate).mockResolvedValue(schedule);
    localStorage.setItem('language', '1');
    render(
      <Router>
        <Dayview />
      </Router>,
      { wrapper: TestProviders },
    );
    await waitFor(() =>
      expect(screen.getByTestId('mockInfoBox')).toBeInTheDocument(),
    );
  });
});
