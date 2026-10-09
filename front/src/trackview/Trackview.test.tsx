import { TestProviders } from '@/_TestUtils/TestProvides';
import { render, screen } from '@testing-library/react';
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

/**
 * LinguiProvider renders null until its catalog import resolves, and this version
 * of Testing Library does not reliably settle a second `findBy*` afterwards. So
 * each test awaits the track name once, then asserts synchronously.
 */
async function renderTrackview() {
  vi.mocked(api.getSchedulingDate).mockResolvedValue(testUtils.schedule);
  const result = render(<Trackview />, { wrapper: TestProviders });
  await screen.findByText('Shooting Track 0', {}, { timeout: 5000 });
  return result;
}

describe('testing Trackview', () => {
  it('should render Trackview', async () => {
    await renderTrackview();
    expect(screen.getByText('Shooting Track 0')).toBeInTheDocument();
  });

  it('reports that no track can be used when the range officer is away', async () => {
    // The shared fixture carries rangeSupervision 'closed' while individual
    // tracks carry trackSupervision 'present' — the combination the customer
    // says cannot occur. The view has to resolve it in the member's favour by
    // reporting the range officer rather than showing the track as usable.
    await renderTrackview();

    // Appears both in the banner and beside every blocked stretch of time.
    expect(
      screen.getAllByText('No range officer present').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText('No track can be used until the range officer arrives.'),
    ).toBeInTheDocument();
  });

  it('marks free time as unavailable rather than free while the range is unsupervised', async () => {
    await renderTrackview();

    expect(screen.getAllByText('No shooting').length).toBeGreaterThan(0);
    expect(screen.queryByText('Free')).not.toBeInTheDocument();
  });

  it('names the reason beside each unavailable stretch of time', async () => {
    await renderTrackview();

    // The reason is written out, never left to colour or to a hover.
    expect(
      screen.getAllByText('No range officer present').length,
    ).toBeGreaterThan(1);
  });

  it('lists the three lohkot of the pistol track separately', async () => {
    await renderTrackview();

    expect(screen.getAllByText('Lohko 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lohko 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lohko 3').length).toBeGreaterThan(0);
  });
});
