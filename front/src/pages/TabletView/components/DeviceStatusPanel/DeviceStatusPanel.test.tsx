import { TestProviders } from '@/_TestUtils/TestProvides';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import api from '../../../../api/api';
import { DeviceStatusPanel } from './DeviceStatusPanel';

vi.mock('../../../../api/api');

const deviceList = [
  { id: 1, device_name: 'Device 1', status: 'free' },
  { id: 2, device_name: 'Device 2', status: 'reserved' },
];

describe('DeviceStatusPanel Component', () => {
  it('Should render all devices', async () => {
    vi.mocked(api.getAllDevices).mockResolvedValue(deviceList);

    render(<DeviceStatusPanel />, { wrapper: TestProviders });

    for (const device of deviceList) {
      expect(await screen.findByText(device.device_name)).toBeInTheDocument();
    }
  });
});
