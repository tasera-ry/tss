import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { getSchedulingWeek } from '../../utils/Utils';
import { Weekview } from './WeekView';
import testUtils, { schedulingWeek} from '../../_TestUtils/TestUtils';
import { TestProviders } from '@/_TestUtils/TestProvides';

const { date, week } = testUtils;

// Mock the InfoBox component
vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock(import("../../utils/Utils"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getSchedulingWeek: vi.fn(),
  }
})

describe('testing weekview', () => {
  it('should render weekView', async () => {
    vi.mocked(getSchedulingWeek).mockResolvedValue(schedulingWeek as any);
    await act(async () => {
      render(
        <Router>
          <Weekview />
        </Router>, {wrapper: TestProviders}
      );
    });
    await waitFor(() =>
      expect(screen.getByText('Range officer present')).toBeInTheDocument(),
    );
  });

  it('should render the mocked InfoBox component', async () => {
    vi.mocked(getSchedulingWeek).mockResolvedValue(schedulingWeek as any);
    await act(async () => {
      render(
        <Router>
          <Weekview />
        </Router>, {wrapper: TestProviders}
      );
    });
    await waitFor(() =>
      expect(screen.getByTestId('mockInfoBox')).toBeInTheDocument(),
    );
  });
});
