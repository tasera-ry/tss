import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { DeviceStatusList } from './DeviceStatusList';
import api from '../api/api';
import { TestProviders } from '@/_TestUtils/TestProvides';

vi.mock('../api/api');


describe('ButtonComponent', () => {
  it('fetches and displays devices successfully', async () => {
    const mockDevices = [
        { id: 1, device_name: 'Device 1', status: 'free' },
        { id: 2, device_name: 'Device 2', status: 'reserved' }
    ];
    vi.mocked(api.getAllDevices).mockResolvedValue(mockDevices);

    render(<DeviceStatusList />, { wrapper: TestProviders });
    await waitFor(() => {
        expect(screen.getByText('Device 1')).toBeInTheDocument();
        expect(screen.getByText('Device 2')).toBeInTheDocument();
    });
  });
});
