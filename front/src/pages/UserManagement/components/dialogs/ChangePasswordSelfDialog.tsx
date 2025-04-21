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
  InputLabel,
  TextField,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import NiceInputPassword from 'react-nice-input-password';
import { z } from 'zod';

export function ChangePasswordSelfDialog({ currentUser }) {
  const { t } = useLingui();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const schema = useMemo(() => {
    return z.object({
      oldPassword: z.string().min(8, { message: t`Old password is required` }),
      newPassword: z.string().min(8, { message: t`New password is required` }),
    });
  }, [t]);

  const form = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
    resolver: zodResolver(schema),
  });

  const onChangePassword = useCallback(
    async (data) => {
      const secure = window.location.protocol === 'https:';
      const success = await api.signIn(
        currentUser.username,
        data.oldPassword,
        secure,
      );
      if (success) {
        await api.updateUser({
          id: currentUser.id,
          password: data.newPassword,
        });
        setIsDialogOpen(false);
      } else {
        form.setError('oldPassword', { message: t`Old password is incorrect` });
      }
    },
    [currentUser, form.setError, t, setIsDialogOpen],
  );

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="contained"
        className="bg-turquoise! text-black! hover:bg-turquoise/80! rounded-full!"
      >
        {t`Change password`}
      </Button>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <form onSubmit={form.handleSubmit(onChangePassword)}>
          <DialogTitle id="dialog-change-own-pass-title">
            {t`Change password`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t`Give your current and new password`}
            </DialogContentText>

            <TextField
              type="password"
              value={form.watch('oldPassword')}
              {...form.register('oldPassword')}
              margin="dense"
              id="oldpassword"
              label={t`Current password`}
              fullWidth
              error={form.formState.errors.oldPassword !== undefined}
              helperText={form.formState.errors.oldPassword?.message}
            />

            <br />
            <br />

            <NiceInputPassword
              type="password"
              LabelComponent={InputLabel}
              InputComponent={TextField}
              value={form.watch('newPassword')}
              onChange={(e) => form.setValue('newPassword', e.value)}
              margin="dense"
              label={t`New password`}
              name="passwordField"
              fullWidth
              securityLevels={[
                {
                  descriptionLabel: t`Minimum ${1} number`,
                  validator: /.*[0-9].*/,
                },
                {
                  descriptionLabel: t`Minimum ${1} lowercase letter`,
                  validator: /.*[a-z].*/,
                },
                {
                  descriptionLabel: t`Minimum ${1} uppercase letter`,
                  validator: /.*[A-Z].*/,
                },
                {
                  descriptionLabel: t`Minimum length of password is 6 characters`,
                  validator: /^.{6,}$/,
                },
              ]}
              showSecurityLevelBar
              showSecurityLevelDescription
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="contained"
              color="inherit"
              data-testid="ChangePasswordSelfDialog-Cancel"
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              data-testid="ChangePasswordSelfDialog-Save"
            >
              {t`Save changes`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
