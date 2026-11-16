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
  const isReserved = device.status === 'reserved';

  return (
    <div
      style={{
        // Free green, reserved red, as on the track cards. Text says which.
        border: isReserved
          ? '2px solid var(--color-status-closed, #8a1c18)'
          : '2px solid var(--color-status-present, #46a457)',
        backgroundColor: isReserved
          ? 'var(--color-status-closed, #8a1c18)'
          : 'var(--color-status-free, #dcefdc)',
        color: isReserved
          ? 'var(--color-white, #ffffff)'
          : 'var(--color-black-tint-70, #4d4d4d)',
      }}
      className={classNames(
        'rounded-xl flex flex-col text-left w-full min-w-0 font-medium py-1 px-2 transition-colors',
      )}
    >
      <span className="font-bold max-w-full break-words">
        {device.device_name}
      </span>
      <span className={classNames('text-sm', isReserved && 'font-bold')}>
        {isReserved ? t`Reserved` : t`Free`}
      </span>
    </div>
  );
}
