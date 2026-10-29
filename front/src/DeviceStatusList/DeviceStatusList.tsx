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
        'rounded-xl flex flex-col text-left w-full min-w-0  border-2 font-medium py-1 px-2',
        'bg-[#e3e4df]',
        device.status === 'reserved' ? 'border-red-800' : 'border-[#a2a79c]',
      )}
    >
      <span className="font-bold text-slate-900 max-w-full break-words">{device.device_name}</span>
      <span className={classNames(
        'text-sm', 
        device.status === 'reserved' ? 'font-bold' : 'text-slate-600'
      )}
      >
        {device.status === 'reserved' ? t`Reserved` : t`Free`}
      </span>
    </div>
  );
}
