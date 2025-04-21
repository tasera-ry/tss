import api from '@/api/api';
import { SelectAssociation } from '@/pages/UserManagement/components/SelectAssociation';
import { SelectRole } from '@/pages/UserManagement/components/SelectRole';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import NiceInputPassword from 'react-nice-input-password';
import { useQueryClient } from 'react-query';
import { z } from 'zod';

export function AddUserDialog({ associationList }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userSchema = useMemo(() => {
    const rangeOfficerSchema = z.object({
      username: z
        .string({ message: t`Username is required` })
        .min(1, { message: t`Username is required` }),
      password: z.string().min(1, { message: t`Password is required` }),
      email: z
        .string({ message: t`Email is required` })
        .email({ message: t`Invalid email address` }),
      role: z.literal('rangeofficer', { message: t`Role is required` }),
      associationId: z.number({ message: t`Association is required` }),
    });

    const otherRoleSchema = z.object({
      username: z
        .string({ message: t`Username is required` })
        .min(1, { message: t`Username is required` }),
      password: z.string().min(1, { message: t`Password is required` }),
      email: z
        .string({ message: t`Email is required` })
        .email({ message: t`Invalid email address` }),
      role: z.union([z.literal('association'), z.literal('superuser')]),
    });

    return z.union([rangeOfficerSchema, otherRoleSchema]);
  }, [t]);

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'rangeofficer',
      associationId: null,
    },
    resolver: zodResolver(userSchema),
  });

  const onSaveUser = useCallback(
    async (data) => {
      const user = {
        name: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        associationId:
          data.role === 'rangeofficer' ? data.associationId : undefined,
      };
      const success = await api.createUser(user);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['userList'] });
        setIsDialogOpen(false);
      }
    },
    [queryClient],
  );

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="contained"
        className="bg-green-light! text-black! hover:bg-green-light/80! rounded-full! text-xs! text-nowrap!"
      >
        {t`Create new user`}
      </Button>
      <Dialog
        id="dialog-add-user"
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        keepMounted
      >
        <form onSubmit={form.handleSubmit(onSaveUser)}>
          <DialogTitle id="dialog-add-user-title">
            {t`Create new user`}
          </DialogTitle>
          <DialogContent className="flex flex-col gap-4">
            <TextField
              margin="dense"
              id="name"
              label={t`Username`}
              fullWidth
              {...form.register('username')}
              error={form.formState.errors.username !== undefined}
              helperText={form.formState.errors.username?.message}
            />
            <NiceInputPassword
              LabelComponent={InputLabel}
              InputComponent={TextField}
              margin="dense"
              label={t`Password`}
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
              value={form.watch('password')}
              onChange={(e) => form.setValue('password', e.value)}
              error={form.formState.errors.password !== undefined}
              helperText={form.formState.errors.password?.message}
            />

            <TextField
              margin="dense"
              id="sposti"
              label={t`Email`}
              {...form.register('email')}
              error={form.formState.errors.email !== undefined}
              helperText={form.formState.errors.email?.message}
            />

            <SelectRole form={form} />
            <SelectAssociation form={form} associationList={associationList} />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="contained"
              color="inherit"
              data-testid="AddUserDialog-Cancel"
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              data-testid="AddUserDialog-Save"
            >
              {t`Save changes`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
