import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import Trackview from './Trackview';
import api from '../api/api';
import testUtils from '../_TestUtils/TestUtils';
import { TestProviders } from '@/_TestUtils/TestProvides';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({
      date: '2020-02-20',
      track: 'Shooting Track 0',
    }),
  }
});

describe('testing Trackview', () => {
  it('should render Trackview', async () => {
    const { schedule } = testUtils;

    api.getSchedulingDate = vi.fn(() => schedule);

    render(<Trackview />, { wrapper: TestProviders });
    console.log(screen.debug());
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );
  });
});
