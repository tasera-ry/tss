import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Tabletview from './rangeofficer';
import * as utils from '../../utils/Utils';
import testUtils from '../../_TestUtils/TestUtils';
import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '../../api/api';

vi.mock('axios');
vi.mock('../../api/api');
vi.mock('../../utils/Utils');

vi.mock('socket.io-client', () => {
  const client = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }

  client.on.mockReturnValue(client)
  client.emit.mockReturnValue(client)
  client.disconnect.mockReturnValue(client)
  return {
    default: () => client,
  };
});

vi.mock('../../infoBox/InfoBox', () => ({
  default: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

describe('testing rangeofficer', () => {

  beforeEach(() => {
    vi.mocked(utils.validateLogin).mockResolvedValue(true);
    vi.mocked(api.getSchedulingDate).mockResolvedValue(testUtils.schedule);
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'role=rangemaster',
    });
  })

  it('should render TabletView', async () => {
    await act(async () => {
      render(
        <Tabletview />,
        { wrapper: TestProviders }
      );
    });

    await waitFor(() => expect(screen.getByTestId('rangeOfficerStatus')).toBeInTheDocument());
  });

  it('should render tracks', async () => {
    await act(async() => render(<Tabletview />, { wrapper: TestProviders }));

    await waitFor(() =>
      expect(screen.getByText('Shooting Track 0', {exact: false})).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByText('Shooting Track 6', {exact: false})).toBeInTheDocument(),
    );
  });

  it('should render track officer status', async () => {
    await act(async() => render(<Tabletview />, { wrapper: TestProviders }));
    testUtils.schedule.tracks.forEach(track => {
      expect(screen.getByTestId(`trackSupervisorButton-${track.id}`)).toBeInTheDocument();
    });
  });
});
