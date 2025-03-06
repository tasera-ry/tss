import { useMemo } from 'react';
import {
  Button,
} from '@mui/material';
import api from '../../../../api/api';
import colors from '../colors.module.scss';
import { msg } from '@lingui/core/macro';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useLingui } from '@lingui/react/macro';

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
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  )

};

const deviceStatuses = {
  free: {
    statusMsg: msg`Free`,
    color: colors.green,
  },
  reserved: {
    statusMsg: msg`Reserved`,
    color: colors.redLight,
  }
}


function DeviceCard({ device }) {
  const { i18n } = useLingui();
  const queryClient = useQueryClient()

  const buttonState = useMemo(() => deviceStatuses[device.status], [device.status])

  const deviceStatusMutation = useMutation({
    mutationFn: () => api.patchDevice(device.id, { status: device.status === 'free' ? 'reserved' : 'free' }),
    onSuccess: () => {
      queryClient.setQueryData(['devices'], (old: any) => {
        return old.map((d) => d.id === device.id ? { ...d, status: device.status === 'free' ? 'reserved' : 'free' } : d)
      })
    }
  })


  return (
    <Button
      style={{ backgroundColor: buttonState.color }}
      size="large"
      variant="contained"
      className='w-[230px] flex flex-col items-center justify-center hover:before:content-[""] before:absolute before:inset-0 hover:before:bg-black/20 before:z-10 before:rounded'
      onClick={() => deviceStatusMutation.mutate()}
      disabled={deviceStatusMutation.isLoading}
      data-testid={`device-card-${device.id}`}
    >
      <span>{device.device_name}</span>
      <span className='text-sm'>{i18n._(buttonState.statusMsg)}</span>
    </Button>
  )
}
