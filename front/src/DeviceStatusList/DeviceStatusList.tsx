import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import { useQuery } from 'react-query';
import api from '../api/api';

export function DeviceStatusList() {
  const devices = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.getAllDevices(),
    select: (data) =>
      data.sort((a, b) => a.device_name.localeCompare(b.device_name)),
  });

  if (!devices.data) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {devices.data.map((device) => (
        <DeviceLabel key={device.id} device={device} />
      ))}
    </div>
  );
}

function DeviceLabel({ device }: { device: any }) {
  const { t } = useLingui();

  return (
    <div
      className={classNames(
        'rounded-xl flex flex-col text-nowrap w-full items-center justify-center font-medium py-1 px-2',
        device.status === 'reserved' ? 'bg-red-light' : 'bg-green',
      )}
    >
      <span>{device.device_name}</span>
      <span className="text-sm">
        {device.status === 'reserved' ? t`Reserved` : t`Free`}
      </span>
    </div>
  );
}
