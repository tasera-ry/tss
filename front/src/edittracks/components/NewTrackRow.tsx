import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Add } from '@mui/icons-material';
import {
  type AlertColor,
  Button,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { z } from 'zod';

interface NewTrackRowProps {
  rangeId: number;
  setToast: (toast: {
    open: boolean;
    message: string;
    severity: AlertColor;
  }) => void;
}

export function NewTrackRow({ rangeId, setToast }: NewTrackRowProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const newTrackSchem = useMemo(() => {
    return z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      short_description: z.string().min(1),
    });
  }, []);

  type NewTrack = z.infer<typeof newTrackSchem>;

  const form = useForm({
    resolver: zodResolver(newTrackSchem),
  });

  const trackAddMutation = useMutation({
    mutationFn: async (track: any) => {
      const response = await axios.post('/api/track', track);
      return response.data;
    },
    onSuccess: (track) => {
      queryClient.setQueryData(['tracks'], (old: any) => [...old, track]);
      setToast({
        open: true,
        message: t`Track added successfully`,
        severity: 'success',
      });
    },
    onError: () => {
      setToast({
        open: true,
        message: t`Error adding track`,
        severity: 'error',
      });
    },
  });

  const onSubmit = (newRow: NewTrack) => {
    trackAddMutation.mutate({
      ...newRow,
      range_id: rangeId,
    });
  };

  return (
    <TableRow>
      <TableCell>
        <TextField
          {...form.register('name')}
          placeholder={t`Name`}
          error={!!form.formState.errors.name}
          helperText={form.formState.errors.name?.message}
          slotProps={{
            htmlInput: {
              'data-testid': 'new-track-name',
            },
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          className="w-full"
          {...form.register('description')}
          placeholder={t`Description`}
          error={!!form.formState.errors.description}
          helperText={form.formState.errors.description?.message}
          slotProps={{
            htmlInput: {
              'data-testid': 'new-track-description',
            },
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          {...form.register('short_description')}
          placeholder={t`Short description`}
          error={!!form.formState.errors.short_description}
          helperText={form.formState.errors.short_description?.message}
          slotProps={{
            htmlInput: {
              'data-testid': 'new-track-short-description',
            },
          }}
        />
      </TableCell>
      <TableCell>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          startIcon={<Add />}
          data-testid="new-track-add"
        >
          {t`Add`}
        </Button>
      </TableCell>
    </TableRow>
  );
}
