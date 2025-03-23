import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import {
  type AlertColor,
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { z } from 'zod';

interface TrackRowProps {
  track: any;
  setToast: (toast: {
    open: boolean;
    message: string;
    severity: AlertColor;
  }) => void;
}

export function TrackRow({ track, setToast }: TrackRowProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [editingRow, setEditingRow] = useState(false);

  const trackSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      short_description: z.string().min(1),
    });
  }, []);

  type Track = z.infer<typeof trackSchema>;

  const form = useForm({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      name: track.name,
      description: track.description,
      short_description: track.short_description,
    },
  });

  const trackUpdateMutation = useMutation({
    mutationFn: async (track: any) => {
      const response = await axios.put(`/api/track/${track.id}`, track);
      return response.data;
    },
    onSuccess: (_, updatedTrack) => {
      queryClient.setQueryData(['tracks'], (old: any) =>
        old.map((row: any) =>
          row.id === updatedTrack.id ? updatedTrack : row,
        ),
      );
      setEditingRow(false);
      setToast({
        open: true,
        message: t`Track updated successfully`,
        severity: 'success',
      });
    },
    onError: () => {
      setToast({
        open: true,
        message: t`Error updating track`,
        severity: 'error',
      });
    },
  });

  const trackDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/track/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['tracks'], (old: any) =>
        old.filter((row: any) => row.id !== track.id),
      );
      setToast({
        open: true,
        message: t`Track deleted successfully`,
        severity: 'success',
      });
    },
    onError: () => {
      setToast({
        open: true,
        message: t`Error deleting track`,
        severity: 'error',
      });
    },
  });

  const onSave = (updatedTrack: Track) => {
    trackUpdateMutation.mutate({
      ...updatedTrack,
      id: track.id,
    });
  };

  const onDeleteRow = async () => {
    const confirm = window.confirm(
      t`Are you sure you want to delete this track?`,
    );
    if (confirm) {
      trackDeleteMutation.mutate(track.id);
    }
  };

  return (
    <TableRow>
      {editingRow ? (
        <>
          <TableCell>
            <TextField
              {...form.register('name')}
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              slotProps={{
                htmlInput: {
                  'data-testid': `edit-track-name-${track.id}`,
                },
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              className="w-full"
              {...form.register('description')}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
              slotProps={{
                htmlInput: {
                  'data-testid': `edit-track-description-${track.id}`,
                },
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              {...form.register('short_description')}
              error={!!form.formState.errors.short_description}
              helperText={form.formState.errors.short_description?.message}
              slotProps={{
                htmlInput: {
                  'data-testid': `edit-track-short-description-${track.id}`,
                },
              }}
            />
          </TableCell>
          <TableCell>
            <IconButton
              onClick={form.handleSubmit(onSave)}
              data-testid={`edit-track-save-${track.id}`}
            >
              <Save />
            </IconButton>
            <IconButton
              onClick={() => setEditingRow(false)}
              data-testid={`edit-track-cancel-${track.id}`}
            >
              <Cancel />
            </IconButton>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell>{track.name}</TableCell>
          <TableCell>{track.description}</TableCell>
          <TableCell>{track.short_description}</TableCell>
          <TableCell className="flex! flex-nowrap!">
            <Tooltip title={t`Edit`}>
              <IconButton
                onClick={() => setEditingRow(true)}
                data-testid={`edit-track-${track.id}`}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title={t`Delete`}>
              <IconButton
                onClick={onDeleteRow}
                data-testid={`delete-track-${track.id}`}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
