import { useCallback } from 'react';
import { useCookies } from 'react-cookie';

import api from '@/api/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import {
  Button,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { z } from 'zod';

export const newMessageSchema = z.object({
  message: z.string().min(1),
  start: z.string().date(),
  end: z.string().date(),
  recipients: z.string().min(1),
  // Not implemented yet
  // show_weekly: z.boolean(),
  // show_monthly: z.boolean(),
});

export type NewMessage = z.infer<typeof newMessageSchema>;

export function NewMessageForm() {
  const { t } = useLingui();
  const [cookies] = useCookies(['username']);

  const queryClient = useQueryClient();

  const form = useForm<NewMessage>({
    resolver: zodResolver(newMessageSchema),
    defaultValues: {
      message: '',
      start: moment().format('YYYY-MM-DD'),
      end: moment().add(1, 'day').format('YYYY-MM-DD'),
      recipients: 'all',
    },
  });

  const userQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    initialData: [],
  });

  const newMessageMutation = useMutation({
    mutationFn: (data: NewMessage) =>
      api.postInfoMessage({
        ...data,
        sender: cookies.username,
        show_weekly: false,
        show_monthly: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infoMessages'] });
      form.reset();
    },
    onError: () => {
      alert(t`Error sending message`);
    },
  });

  const onSubmit = useCallback((data: NewMessage) => {
    newMessageMutation.mutate(data);
  }, [newMessageMutation.mutate]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4 items-start pb-2"
    >
      <TextField
        label={t`Message`}
        multiline
        variant="standard"
        fullWidth
        error={!!form.formState.errors.message}
        helperText={form.formState.errors.message?.message?.toString()}
        {...form.register('message')}
      />
      <fieldset className="flex flex-col sm:flex-row gap-2 w-full">
        <TextField
          required
          type="date"
          fullWidth
          label={t`Start date`}
          {...form.register('start')}
          error={!!form.formState.errors.start}
          helperText={form.formState.errors.start?.message?.toString()}
          slotProps={{
            htmlInput: {
              min: moment().format('YYYY-MM-DD'),
            },
          }}
        />
        <TextField
          required
          type="date"
          fullWidth
          label={t`End date`}
          {...form.register('end')}
          error={!!form.formState.errors.end}
          helperText={form.formState.errors.end?.message?.toString()}
          slotProps={{
            htmlInput: {
              min: moment().format('YYYY-MM-DD'),
            },
          }}
        />
      </fieldset>
      <Select
        fullWidth
        value={form.watch('recipients')}
        MenuProps={{ style: { maxHeight: 400 } }}
        {...form.register('recipients')}
        error={!!form.formState.errors.recipients}
      >
        <MenuItem value={'all'}>{t`Send public message`}</MenuItem>
        <MenuItem value={'rangemaster'}>{t`Rangemaster`}</MenuItem>
        {userQuery.data.map((user) => (
          <MenuItem key={user.id} value={user.name}>
            {user.name}
          </MenuItem>
        ))}
      </Select>
      <Button
        type="submit"
        className="bg-sand! disabled:bg-gray-300!"
        variant="contained"
        disabled={!form.formState.isValid || newMessageMutation.isLoading}
      >
        {newMessageMutation.isLoading ? (
          <CircularProgress size={20} />
        ) : (
          t`Send`
        )}
      </Button>
    </form>
  );
}
