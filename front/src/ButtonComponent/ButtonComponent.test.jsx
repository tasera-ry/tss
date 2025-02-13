import { render, fireEvent, waitFor } from '@testing-library/react';
import ButtonComponent from './ButtonComponent';
import api from '../api/api';

vi.mock('../api/api');


describe('ButtonComponent', () => {
  beforeEach(() => {
    const devices = [
      { id: 1, device_name: 'Device 1', status: 'free' },
      { id: 2, device_name: 'Device 2', status: 'reserved' }
    ];
    api.getAllDevices.mockResolvedValue(devices);
  });

  it('fetches and displays devices successfully', async () => {
    const mockDevices = [
        { id: 1, device_name: 'Device 1', status: 'free' },
        { id: 2, device_name: 'Device 2', status: 'reserved' }
    ];
    api.getAllDevices.mockResolvedValue(mockDevices);

    const { findByText } = render(<ButtonComponent />);

    const device1 = await findByText('Device 1');
    const device2 = await findByText('Device 2');

    expect(device1).toBeInTheDocument();
    expect(device2).toBeInTheDocument();
    expect(device1).toHaveTextContent('Device 1');
    expect(device2).toHaveTextContent('Device 2');
});

  it.skip('displays the status when hovered', async () => {
    const { findByText } = render(<ButtonComponent />);
    const deviceButton = await findByText('Device 1');

    fireEvent.mouseEnter(deviceButton);
    await waitFor(() => {
      expect(deviceButton).toHaveTextContent('free');
    });

    fireEvent.mouseLeave(deviceButton);
    await waitFor(() => {
      expect(deviceButton).toHaveTextContent('Device 1');
    });
  });

  it('toggles the text on click in mobile mode', async () => {
    Object.defineProperty(window, 'ontouchstart', { value: {} });
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 1 });

    const { findByText } = render(<ButtonComponent />);
    const deviceButton = await findByText('Device 1');

    fireEvent.click(deviceButton);
    await waitFor(() => {
        expect(deviceButton).toHaveTextContent('free');
    });
});

it('displays loading indicator when devices are being fetched', () => {
    const { getByText } = render(<ButtonComponent />);
    expect(getByText('Fetching Devices...')).toBeInTheDocument();
});
});
