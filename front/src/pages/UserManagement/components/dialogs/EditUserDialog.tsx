import api from '@/api/api';
import { SelectAssociation } from '@/pages/UserManagement/components/SelectAssociation';
import { SelectRole } from '@/pages/UserManagement/components/SelectRole';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import NiceInputPassword from 'react-nice-input-password';
import { useQueryClient } from 'react-query';
import { z } from 'zod';

export function EditUserDialog({ user, associationList }) {
  const { t } = useLingui();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) setTabValue(0);
  }, [isDialogOpen]);

  const [tabValue, setTabValue] = useState(0);

  return (
    <>
      <IconButton onClick={() => setIsDialogOpen(true)} aria-label="Edit">
        <Tooltip title={t`Edit`}>
          <EditIcon />
        </Tooltip>
      </IconButton>
      <Dialog
        id="dialog-add-user"
        className="relative"
        fullWidth
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <IconButton
          className="absolute! top-1! right-1!"
          onClick={() => setIsDialogOpen(false)}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>{t`Edit user: ${user.name}`}</DialogTitle>
        <TabContext value={tabValue}>
          <TabList onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={t`Edit user`} value={0} />
            <Tab label={t`Change password`} value={1} />
          </TabList>
          <EditUserTab
            tabValue={0}
            user={user}
            associationList={associationList}
            setIsDialogOpen={setIsDialogOpen}
          />
          <ChangePasswordTab
            tabValue={1}
            user={user}
            setIsDialogOpen={setIsDialogOpen}
          />
        </TabContext>
      </Dialog>
    </>
  );
}

function EditUserTab({ tabValue, user, associationList, setIsDialogOpen }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const userSchema = useMemo(() => {
    const rangeOfficerSchema = z.object({
      name: z.string().min(1, { message: t`Name is required` }),
      email: z
        .string({ message: t`Email is required` })
        .email({ message: t`Invalid email address` }),
      role: z.literal('rangeofficer', { message: t`Role is required` }),
      associationId: z.number({ message: t`Association is required` }),
    });

    const otherRoleSchema = z.object({
      name: z
        .string({ message: t`Name is required` })
        .min(1, { message: t`Name is required` }),
      email: z
        .string({ message: t`Email is required` })
        .email({ message: t`Invalid email address` }),
      role: z.union([z.literal('association'), z.literal('superuser')]),
    });

    return z.union([rangeOfficerSchema, otherRoleSchema]);
  }, [t]);

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      associationId: user.associationId,
    },
    resolver: zodResolver(userSchema),
  });

  const onSaveUser = useCallback(
    async (data) => {
      const updatedUser = {
        id: user.id,
        name: data.name,
        email: data.email,
        role: data.role,
        associationId:
          data.role === 'rangeofficer' ? data.associationId : undefined,
      };
      await api.updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['userList'] });
      setIsDialogOpen(false);
    },
    [user, queryClient, setIsDialogOpen],
  );

  const onDeleteUser = useCallback(async () => {
    const confirm = window.confirm(
      t`Are you sure you want to delete ${user.name}?`,
    );
    if (!confirm) return;
    await api.deleteUser(user.id);
    queryClient.invalidateQueries({ queryKey: ['userList'] });
    setIsDialogOpen(false);
  }, [user, queryClient, t, setIsDialogOpen]);

  return (
    <TabPanel value={tabValue}>
      <form onSubmit={form.handleSubmit(onSaveUser)}>
        <DialogContent className="p-2! flex flex-col gap-2">
          <TextField
            label={t`Name`}
            {...form.register('name')}
            error={form.formState.errors.name !== undefined}
            helperText={form.formState.errors.name?.message}
          />
          <TextField
            label={t`Email`}
            {...form.register('email')}
            error={form.formState.errors.email !== undefined}
            helperText={form.formState.errors.email?.message}
          />
          <SelectRole form={form} />
          <SelectAssociation form={form} associationList={associationList} />
        </DialogContent>
        <DialogActions className="flex flex-row justify-between! w-full">
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={onDeleteUser}
          >
            {t`Delete user`}
          </Button>
          <Button type="submit" variant="contained" color="success">
            {t`Save`}
          </Button>
        </DialogActions>
      </form>
    </TabPanel>
  );
}
function ChangePasswordTab({ tabValue, user, setIsDialogOpen }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const newPasswordSchema = useMemo(() => {
    return z.object({
      password: z
        .string()
        .min(6, { message: t`Minimum length of password is 6 characters` })
        .regex(/[0-9]/, { message: t`Minimum ${1} number` })
        .regex(/[a-z]/, { message: t`Minimum ${1} lowercase letter` })
        .regex(/[A-Z]/, { message: t`Minimum ${1} uppercase letter` }),
    });
  }, [t]);

  const form = useForm({
    defaultValues: {
      password: '',
    },
    resolver: zodResolver(newPasswordSchema),
  });

  const onSave = useCallback(
    async (data) => {
      const updatedUser = {
        id: user.id,
        password: data.password,
      };
      await api.updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['userList'] });
      setIsDialogOpen(false);
    },
    [user, queryClient, setIsDialogOpen],
  );

  return (
    <TabPanel value={tabValue}>
      <form onSubmit={form.handleSubmit(onSave)}>
        <DialogContent className="p-2!">
          <NiceInputPassword
            type="text"
            LabelComponent={InputLabel}
            InputComponent={TextField}
            className=""
            margin="dense"
            label={t`New password`}
            fullWidth
            value={form.watch('password')}
            onChange={(e) => form.setValue('password', e.value)}
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
          <Button type="submit" variant="contained" color="primary">
            {t`Save`}
          </Button>
        </DialogActions>
      </form>
    </TabPanel>
  );
}
