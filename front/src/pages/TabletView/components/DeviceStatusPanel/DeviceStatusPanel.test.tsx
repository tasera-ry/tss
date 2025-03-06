import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import api from '../../../../api/api';
import { DeviceStatusPanel } from './DeviceStatusPanel';
import { TestProviders } from '@/_TestUtils/TestProvides';

vi.mock('../../../../api/api');

const deviceList = [
    { id: 1, device_name: 'Device 1', status: 'free' },
    { id: 2, device_name: 'Device 2', status: 'reserved' }
]

describe('DeviceStatusPanel Component', () => {
    it('Should render all devices', async () => {
        
        vi.mocked(api.getAllDevices).mockResolvedValue(deviceList);

        render(<DeviceStatusPanel />, { wrapper: TestProviders });

        for (const device of deviceList) {
            expect(await screen.findByText(device.device_name)).toBeInTheDocument();
        }
    });
});
