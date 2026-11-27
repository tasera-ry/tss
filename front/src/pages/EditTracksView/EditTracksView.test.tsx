import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '@/api/api';
import { EditTracksView } from '@/pages/EditTracksView/EditTracksView';
import { validateLogin } from '@/utils/Utils';
import { fireEvent, render, screen, within } from '@testing-library/react';
import axios from 'axios';

vi.mock('@/utils/Utils');
vi.mock('@/api/api');
vi.mock('axios', () => ({
  default: { get: vi.fn(), put: vi.fn(), delete: vi.fn(), post: vi.fn() },
}));

const tracks = [
  {
    id: 2,
    range_id: 1,
    name: 'Rata 2',
    description: '150m RK -rata',
    short_description: '150m RK',
    requires_range_officer: true,
    only_22lr: false,
    daylight_only: false,
  },
  {
    id: 1,
    range_id: 1,
    name: 'Rata 1',
    description: '25m Pistoolirata',
    short_description: '25m pistooli',
    requires_range_officer: true,
    only_22lr: false,
    daylight_only: true,
  },
];

const sections = [
  {
    id: 12,
    track_id: 1,
    position: 2,
    lane_count: 20,
    name: 'Oikea',
    description: '',
  },
  {
    id: 11,
    track_id: 1,
    position: 1,
    lane_count: 20,
    name: 'Vasen',
    description: 'Lähin',
  },
  {
    id: 21,
    track_id: 2,
    position: 1,
    lane_count: 40,
    name: 'Rata 2',
    description: '',
  },
];

async function renderPage() {
  vi.mocked(validateLogin).mockResolvedValue(true);
  vi.mocked(axios.get).mockResolvedValue({ data: tracks });
  vi.mocked(api.getTrackSections).mockResolvedValue(sections);
  for (const write of [
    api.updateTrack,
    api.createTrackSection,
    api.updateTrackSection,
    api.deleteTrackSection,
  ]) {
    vi.mocked(write).mockResolvedValue({} as never);
  }
  render(<EditTracksView />, { wrapper: TestProviders });
  await screen.findByRole('region', { name: 'Rata 1' });
}

const card = (name: string) => within(screen.getByRole('region', { name }));
const save = (name: string) =>
  fireEvent.click(card(name).getByRole('button', { name: 'Save' }));

describe('EditTracksView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows each track in order with its details, rules and sections, and no way to add or delete tracks', async () => {
    await renderPage();
    const regions = screen.getAllByRole('region');
    expect(regions.map((r) => r.getAttribute('aria-labelledby'))).toEqual([
      'track-1',
      'track-2',
    ]);
    const rata1 = card('Rata 1');
    expect(rata1.getByLabelText('Short description')).toHaveValue(
      '25m pistooli',
    );
    expect(rata1.getByLabelText('No shooting in the dark')).toBeChecked();
    expect(rata1.getByLabelText('.22LR only')).not.toBeChecked();
    expect(
      rata1
        .getAllByLabelText('Section name')
        .map((i) => (i as HTMLInputElement).value),
    ).toEqual(['Vasen', 'Oikea']);
    expect(
      screen.queryByRole('button', { name: /Delete|Add$/ }),
    ).not.toBeInTheDocument();
    expect(
      rata1.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
  });

  it("saves the track's details and rules", async () => {
    await renderPage();
    fireEvent.change(card('Rata 1').getByLabelText('Short description'), {
      target: { value: '25m pist. ' },
    });
    fireEvent.click(card('Rata 1').getByLabelText('.22LR only'));
    save('Rata 1');

    await vi.waitFor(() =>
      expect(api.updateTrack).toHaveBeenCalledWith(1, {
        name: 'Rata 1',
        short_description: '25m pist.',
        description: '25m Pistoolirata',
        requires_range_officer: true,
        only_22lr: true,
        daylight_only: true,
      }),
    );
    expect(await card('Rata 1').findByText('Saved')).toBeInTheDocument();
    expect(api.updateTrackSection).not.toHaveBeenCalled();
  });

  it('saves only the sections that changed', async () => {
    await renderPage();
    fireEvent.change(card('Rata 1').getAllByLabelText('Lanes')[1], {
      target: { value: '24' },
    });
    save('Rata 1');

    await vi.waitFor(() =>
      expect(api.updateTrackSection).toHaveBeenCalledWith(12, {
        name: 'Oikea',
        lane_count: 24,
        description: '',
      }),
    );
    expect(api.updateTrackSection).toHaveBeenCalledTimes(1);
    expect(api.updateTrack).not.toHaveBeenCalled();
  });

  it('adds a section once it has a name and lanes', async () => {
    await renderPage();
    fireEvent.click(
      card('Rata 2').getByRole('button', { name: '+ Add section' }),
    );
    expect(card('Rata 2').getByRole('button', { name: 'Save' })).toBeDisabled();

    const names = card('Rata 2').getAllByLabelText('Section name');
    fireEvent.change(names[1], { target: { value: 'Takaosa' } });
    fireEvent.change(card('Rata 2').getAllByLabelText('Lanes')[1], {
      target: { value: '10' },
    });
    save('Rata 2');

    await vi.waitFor(() =>
      expect(api.createTrackSection).toHaveBeenCalledWith({
        track_id: 2,
        name: 'Takaosa',
        lane_count: 10,
        description: '',
      }),
    );
  });

  it('removes a section on save, saying its past bookings go with it, and can undo', async () => {
    await renderPage();
    fireEvent.click(
      card('Rata 1').getAllByRole('button', { name: 'Remove' })[0],
    );
    expect(
      card('Rata 1').getByText('Removed on save, with its past bookings.'),
    ).toBeInTheDocument();
    // The other section is now the last: it cannot go too.
    expect(
      card('Rata 1').getByRole('button', { name: 'Remove' }),
    ).toBeDisabled();

    fireEvent.click(card('Rata 1').getAllByRole('button', { name: 'Undo' })[0]);
    expect(card('Rata 1').getAllByLabelText('Section name')).toHaveLength(2);

    fireEvent.click(
      card('Rata 1').getAllByRole('button', { name: 'Remove' })[0],
    );
    save('Rata 1');
    await vi.waitFor(() =>
      expect(api.deleteTrackSection).toHaveBeenCalledWith(11),
    );
  });

  it("keeps a track's last section", async () => {
    await renderPage();
    expect(
      card('Rata 2').getByRole('button', { name: 'Remove' }),
    ).toBeDisabled();
  });

  it('keeps fewer lanes unsaved when bookings need more, saving the rest', async () => {
    await renderPage();
    vi.mocked(api.updateTrackSection).mockRejectedValueOnce({
      response: {
        status: 409,
        data: { days: [{ date: '2099-06-01', booked: 15 }] },
      },
    });
    fireEvent.change(card('Rata 1').getAllByLabelText('Lanes')[0], {
      target: { value: '10' },
    });
    fireEvent.change(card('Rata 1').getByLabelText('Name'), {
      target: { value: 'Rata 1 (pistooli)' },
    });
    save('Rata 1');

    expect(await card('Rata 1').findByRole('alert')).toHaveTextContent(
      'Not saved: the bookings need more lanes at once on 6/1/2099 (15).',
    );
    expect(api.updateTrack).toHaveBeenCalled();
    expect(card('Rata 1').getAllByLabelText('Lanes')[0]).toHaveValue(10);
    expect(card('Rata 1').getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('keeps a section with bookings when removing it is refused', async () => {
    await renderPage();
    vi.mocked(api.deleteTrackSection).mockRejectedValueOnce({
      response: {
        status: 409,
        data: { days: [{ date: '2099-06-01', booked: 5 }] },
      },
    });
    fireEvent.click(
      card('Rata 1').getAllByRole('button', { name: 'Remove' })[1],
    );
    save('Rata 1');

    expect(await card('Rata 1').findByRole('alert')).toHaveTextContent(
      'Not removed: the section has bookings on 6/1/2099 (5).',
    );
    expect(card('Rata 1').getAllByLabelText('Section name')).toHaveLength(2);
  });
});
