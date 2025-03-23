import { TestProviders } from '@/_TestUtils/TestProvides';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import api from '../api/api';
import { DeviceStatusList } from './DeviceStatusList';

vi.mock('../api/api');

describe('ButtonComponent', () => {
  it('fetches and displays devices successfully', async () => {
    const mockDevices = [
      { id: 1, device_name: 'Device 1', status: 'free' },
      { id: 2, device_name: 'Device 2', status: 'reserved' },
    ];
    vi.mocked(api.getAllDevices).mockResolvedValue(mockDevices);

    render(<DeviceStatusList />, { wrapper: TestProviders });
    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 2')).toBeInTheDocument();
    });
  });
});
