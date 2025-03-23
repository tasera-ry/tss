import { TestProviders } from '@/_TestUtils/TestProvides';
import { DeviceStatusCard } from '@/pages/TabletView/components/DeviceStatusPanel/DeviceStatusCard';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useQueryClient } from 'react-query';
import api from '../../../../api/api';

vi.mock('../../../../api/api');
vi.mock('react-query', async (originalImport) => {
  const originalModule = (await originalImport()) as any;
  return {
    ...originalModule,
    useQueryClient: vi.fn(),
  };
});

const device = {
  id: 1,
  device_name: 'Device 1',
  status: 'free',
};

describe('DeviceStatusCard Component', () => {
  it('Should render device name and status', async () => {
    vi.mocked(api.patchDevice).mockResolvedValue(undefined);

    render(<DeviceStatusCard device={device} />, { wrapper: TestProviders });

    expect(await screen.findByText(device.device_name)).toBeInTheDocument();
    expect(await screen.findByText('Free')).toBeInTheDocument();
  });

  it('Should toggle device status', async () => {
    vi.mocked(api.patchDevice).mockResolvedValue(undefined);
    vi.mocked(useQueryClient).mockImplementation(
      () =>
        ({
          setQueryData: vi.fn(),
        }) as any,
    );

    render(<DeviceStatusCard device={device} />, { wrapper: TestProviders });

    expect(await screen.findByText(device.device_name)).toBeInTheDocument();

    const button = await screen.getByTestId(`device-card-${device.id}`);
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.patchDevice).toHaveBeenCalledWith(device.id, {
        status: 'reserved',
      });
    });
  });
});
