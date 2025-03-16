import api from '@/api/api';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Button } from '@mui/material';
import { useMemo } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import colors from '../../../../colors.module.scss';

const deviceStatuses = {
  free: {
    statusMsg: msg`Free`,
    color: colors.green,
  },
  reserved: {
    statusMsg: msg`Reserved`,
    color: colors.redLight,
  },
};

export function DeviceStatusCard({ device }) {
  const { i18n } = useLingui();
  const queryClient = useQueryClient();

  const buttonState = useMemo(
    () => deviceStatuses[device.status],
    [device.status],
  );

  const deviceStatusMutation = useMutation({
    mutationFn: () =>
      api.patchDevice(device.id, {
        status: device.status === 'free' ? 'reserved' : 'free',
      }),
    onSuccess: () => {
      queryClient.setQueryData(['devices'], (old: any) => {
        return old.map((d) =>
          d.id === device.id
            ? { ...d, status: device.status === 'free' ? 'reserved' : 'free' }
            : d,
        );
      });
    },
  });

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
      <span className="text-sm">{i18n._(buttonState.statusMsg)}</span>
    </Button>
  );
}
