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
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 w-full">
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
        'rounded-xl flex flex-col text-center w-full items-center w-full min-w-0 items-center justify-center font-medium py-1 px-2',
        device.status === 'reserved' ? 'bg-red-light' : 'bg-green',
      )}
    >
      <span className="max-w-full break-words">{device.device_name}</span>
      <span className="text-sm">
        {device.status === 'reserved' ? t`Reserved` : t`Free`}
      </span>
    </div>
  );
}
