import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router, useParams } from 'react-router-dom';
import { Monthview } from './MonthView';
import monthTestUtil from '@/_TestUtils/monthTestUtil';
import api from '@/api/api';
import { TestProviders } from '@/_TestUtils/TestProvides';


vi.mock('axios');

// Mock the InfoBox component
vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock('@/api/api')
vi.mock('react-router-dom', async (originalImport) => {
  const originalModule = await originalImport() as any
  return {
    ...originalModule,
    useParams: vi.fn().mockImplementation(() => ({
      date: undefined,
    })),
  }
});

const mockMonth = monthTestUtil.month;

describe('testing monthview', () => {

  it('should render monthView when URL is broken/invalid', async () => {

    vi.mocked(api.getSchedulingFreeform).mockResolvedValue({
      month: mockMonth('09', '28'),
    });

    vi.setSystemTime('2020-10-21T11:30:57.000Z');
    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview />
      </Router>, {wrapper: TestProviders}
    );
    await waitFor(() =>
      expect(screen.getByText('October 2020')).toBeInTheDocument(),
    );
  });

  it('should render monthview when URL is valid', async () => {
    vi.mocked(api.getSchedulingFreeform).mockResolvedValue({
      month: mockMonth('09', '28'),
    });
    vi.mocked(useParams).mockImplementation(() => ({
      date: '2020-10-21',
    }));

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Monthview />
      </Router>, {wrapper: TestProviders}
    );
    await waitFor(() =>
      expect(screen.getByText('October 2020')).toBeInTheDocument(),
    );
  });

});
