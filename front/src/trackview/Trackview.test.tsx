import { TestProviders } from '@/_TestUtils/TestProvides';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('testing Trackview', () => {
  it('should render Trackview', async () => {
    const { schedule } = testUtils;

    vi.mocked(api.getSchedulingDate).mockResolvedValue(schedule);

    render(<Trackview />, { wrapper: TestProviders });

    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );
  });
});
