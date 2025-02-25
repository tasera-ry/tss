import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import api from '../api/api';
import Devices from './devices';
import { TestProviders } from '@/_TestUtils/TestProvides';

vi.mock('../api/api');

describe('Devices Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        api.getAllDevices.mockResolvedValue([]);
        api.createDevice.mockResolvedValue([{ id: 3, device_name: 'Device 3', status: 'free' }]);
    });

    it('fetches devices on mount and displays them', async () => {
        api.getAllDevices.mockResolvedValue([
            { id: 1, device_name: 'Device 1', status: 'free' },
            { id: 2, device_name: 'Device 2', status: 'reserved' }
        ]);
        render(<Devices />, { wrapper: TestProviders });
        expect(await screen.findByText('Device 1')).toBeInTheDocument();
        expect(await screen.findByText('Device 2')).toBeInTheDocument();
    });

    it('toggles device status correctly', async () => {
        api.getAllDevices.mockResolvedValue([{ id: 1, device_name: 'Device 1', status: 'free' }]);
        api.patchDevice.mockResolvedValue();

        render(<Devices />, { wrapper: TestProviders });
        const switchButton = await screen.findByRole('checkbox');
        fireEvent.click(switchButton);
        await waitFor(() => {
            expect(api.patchDevice).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'reserved' }));
        });
    });
});
