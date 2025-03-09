import api from '../../../../api/api';
import { useQuery } from 'react-query';
import { useLingui } from '@lingui/react/macro';
import { DeviceStatusCard } from '@/pages/TabletView/components/DeviceStatusPanel/DeviceStatusCard';

export function DeviceStatusPanel() {
  const { t } = useLingui();

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.getAllDevices(),
    select: (data) => {
      return data.sort((a, b) => a.device_name.localeCompare(b.device_name))
    },
  });

  if (devicesQuery.isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-4'>
        <h2>{t`Loading devices...`}</h2>
      </div>
    )
  }

  if (devicesQuery.isError) {
    return (
      <div className='flex flex-col items-center justify-center py-4'>
        <h2>{t`Error loading devices`}</h2>
      </div>
    )
  }

  if (!devicesQuery.data || devicesQuery.data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-4'>
        <h2>{t`No devices found`}</h2>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center py-4'>
      <h2 className='text-2xl font-bold'>{t`Devices`}</h2>
      <div className='flex flex-row justify-center flex-wrap gap-2 p-4'>
        {devicesQuery.data.map((device) => (
          <DeviceStatusCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  )

};


