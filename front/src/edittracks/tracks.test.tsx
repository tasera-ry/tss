import { TestProviders } from '@/_TestUtils/TestProvides';
import { EditTracksView } from '@/edittracks/tracks';
import { validateLogin } from '@/utils/Utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

const mockTracks = [
  {
    id: 1,
    range_id: 1,
    name: 'Shooting Track 0',
    description: 'Pistol 300m',
    short_description: '25m testi',
  },
];
const newTrack = {
  id: 2,
  range_id: 1,
  name: 'new name',
  description: 'new description',
  short_description: 'new short description',
};

const data = { data: mockTracks };

vi.mock('../utils/Utils');

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('testing TrackCRUD component', () => {
  beforeEach(() => {
    vi.mocked(validateLogin).mockResolvedValue(true);
    vi.mocked(axios.get).mockResolvedValue({ data: mockTracks });
  });

  it('should render TrackCRUD', async () => {
    await render(<EditTracksView />, { wrapper: TestProviders });

    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );
  });

  it('should add new track in list and call axios post', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: newTrack });

    await render(<EditTracksView />, { wrapper: TestProviders });
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getAllByTestId('new-track-name')[0], {
      target: {
        value: newTrack.name,
      },
    });
    fireEvent.change(screen.getAllByTestId('new-track-description')[0], {
      target: {
        value: newTrack.description,
      },
    });
    fireEvent.change(screen.getAllByTestId('new-track-short-description')[0], {
      target: {
        value: newTrack.short_description,
      },
    });

    fireEvent.click(screen.getByTestId('new-track-add'));
    await waitFor(() =>
      expect(screen.getByText(newTrack.name)).toBeInTheDocument(),
    );
  });

  it('should show modified track in list and call axios post', async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: {} });

    await render(<EditTracksView />, { wrapper: TestProviders });
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId(`edit-track-${mockTracks[0].id}`));
    await waitFor(() =>
      expect(
        screen.getAllByTestId(`edit-track-name-${mockTracks[0].id}`)[0],
      ).toBeInTheDocument(),
    );
    fireEvent.change(
      screen.getAllByTestId(`edit-track-name-${mockTracks[0].id}`)[0],
      {
        target: {
          value: newTrack.name,
        },
      },
    );
    fireEvent.click(screen.getByTestId(`edit-track-save-${mockTracks[0].id}`));
    await waitFor(() =>
      expect(screen.getByText(newTrack.name)).toBeInTheDocument(),
    );
  });

  it('should remove deleted track in list and call axios delete', async () => {
    vi.spyOn(window, 'confirm').mockImplementationOnce(() => true);
    vi.mocked(axios.delete).mockResolvedValue({ data: {} });

    await render(<EditTracksView />, { wrapper: TestProviders });
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId(`delete-track-${mockTracks[0].id}`));
    await waitFor(() =>
      expect(screen.queryByText(mockTracks[0].name)).not.toBeInTheDocument(),
    );
  });
});
