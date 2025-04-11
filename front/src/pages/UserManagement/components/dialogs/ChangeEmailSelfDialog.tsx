import api from '@/api/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { z } from 'zod';

export function ChangeEmailSelfDialog({ currentUser }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const schema = useMemo(() => {
    return z.object({
      email: z.string().email({ message: t`Invalid email address` }),
    });
  }, [t]);

  const form = useForm({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    form.setValue('email', currentUser?.email || '');
  }, [currentUser, form.setValue]);

  const onChangeEmail = useCallback(
    async (data) => {
      await api.updateUser({
        id: currentUser.id,
        email: data.email,
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['userList'] });
    },
    [currentUser, queryClient],
  );

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="contained"
        className="bg-sand! text-black! hover:bg-sand/80! rounded-full!"
      >
        {t`Change email address`}
      </Button>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <form onSubmit={form.handleSubmit(onChangeEmail)}>
          <DialogTitle id="dialog-change-own-email-title">
            {t`Change email address`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t`Please give your new email address`}
            </DialogContentText>

            <div>{`${t`Current email address`}: ${currentUser?.email}`}</div>
            <TextField
              type="text"
              value={form.watch('email')}
              {...form.register('email')}
              margin="dense"
              id="newemail"
              label={t`Change email address`}
              fullWidth
              error={form.formState.errors.email !== undefined}
              helperText={form.formState.errors.email?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="contained"
              color="inherit"
            >
              {t`Cancel`}
            </Button>
            <Button type="submit" variant="contained" color="success">
              {t`Save changes`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
