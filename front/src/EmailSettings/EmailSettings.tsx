import { CollapsibleTextField } from '@/EmailSettings/components/CollapsibleTextField';
import { ToggleField } from '@/EmailSettings/components/ToggleFIeld';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import {
  type AlertColor,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { z } from 'zod';

export function EmailSettingsView() {
  const { t } = useLingui();

  const emailSettingsQuery = useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const res = await fetch('/api/email-settings');
      if (!res.ok) {
        throw new Error('Failed to fetch email settings');
      }
      const data = await res.json();
      return {
        ...data,
        sendPendingTime: new Date(data.sendPendingTime),
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (emailSettingsQuery.isLoading) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <CircularProgress />
          <span>{t`Loading email settings...`}</span>
        </div>
      </div>
    );
  }

  if (emailSettingsQuery.isError || !emailSettingsQuery.data) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <span>{t`Error loading email settings`}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-4 max-w-[min(90vw,1000px)]">
        <EmailSettings emailSettings={emailSettingsQuery.data} />
      </div>
    </div>
  );
}

const EmailSettings = ({ emailSettings }) => {
  const { t } = useLingui();

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({ open: false, message: '', type: 'info' });

  const emailSettingsSchema = useMemo(
    () =>
      z.object({
        sender: z.string().email(),
        user: z.string().email(),
        pass: z.string().min(1),
        host: z.string().min(1),
        port: z.string().min(1),
        cc: z.string().email().or(z.literal('')),
        secure: z.string(),
        shouldQueue: z.string(),
        shouldSend: z.string(),
        assignedMsg: z.string(),
        updateMsg: z.string(),
        reminderMsg: z.string(),
        declineMsg: z.string(),
        feedbackMsg: z.string(),
        resetpassMsg: z.string(),
        collageMsg: z.string(),
        sendPendingTime: z.date(),
      }),
    [t],
  );

  type EmailSettings = z.infer<typeof emailSettingsSchema>;

  const form = useForm<EmailSettings>({
    defaultValues: emailSettings,
    resolver: zodResolver(emailSettingsSchema),
  });

  const sendPendingEmailsMutation = useMutation({
    mutationFn: async () => fetch('/api/send-pending'),
    onSuccess: async (res) => {
      const result = await res.json();
      // Sending pending emails failed
      if (res.status === 404) {
        // no pending emails to send
        setNotification({
          open: true,
          message: t`No pending messages to send.`,
          type: 'success',
        });
      } else if (res.status !== 200) {
        setNotification({
          open: true,
          message: t`Sending pending messages failed!`,
          type: 'error',
        });
      }
      // Sending pending emails was successful
      else if (res.status === 200 && result.message) {
        setNotification({
          open: true,
          message: t`No pending messages to send.`,
          type: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: t`Pending messages sent successfully!`,
          type: 'success',
        });
      }
    },
    onError: (error) => {
      console.error('Sending pending emails failed:', error);
      setNotification({
        open: true,
        message: t`Sending pending messages failed!`,
        type: 'error',
      });
    },
  });

  const emailSettingsMutation = useMutation({
    mutationFn: async (settings: EmailSettings) => {
      const response = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return response;
    },
    onSuccess: async (res) => {
      if (res.status !== 200) {
        const data = await res.json();
        if (data.code === 'EAUTH') {
          setNotification({
            open: true,
            message: t`Wrong email or password!`,
            type: 'error',
          });
        } else if (data.code === 'EDNS') {
          setNotification({
            open: true,
            message: t`DNS resolution failed. Please check that the SMTP host is correct.`,
            type: 'error',
          });
        } else if (data.code === 'ESOCKET') {
          setNotification({
            open: true,
            message: t`Connection failed. Please check the server, port, and SSL settings.`,
            type: 'error',
          });
        } else if (data.code === 'ETIMEDOUT') {
          setNotification({
            open: true,
            message: t`Connection timed out. Check network connectivity.!`,
            type: 'error',
          });
        } else {
          console.error('Saving email settings failed:', data);
          throw new Error('Unrecognized error code: ' + data.code);
        }
      } else {
        setNotification({
          open: true,
          message: t`Successfully updated!`,
          type: 'success',
        });
      }
    },
    onError: () => {
      setNotification({
        open: true,
        message: t`Something went wrong!`,
        type: 'error',
      });
    },
  });

  const handleSubmit = useCallback(
    async (e) => {
      emailSettingsMutation.mutate({
        ...e,
        sendPendingTime: e.sendPendingTime.toISOString(),
      });
    },
    [emailSettingsMutation],
  );

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-row flex-wrap justify-center gap-4"
    >
      <FormLabel component="legend" className="text-2xl!">
        {t`Email settings`}
      </FormLabel>
      <div className="flex flex-col gap-4 border border-gray-300 bg-gray-100 rounded p-2 shadow w-full">
        <FormLabel>{t`SMTP settings`}</FormLabel>
        <TextField
          {...form.register('host')}
          label="Host"
          error={!!form.formState.errors.host}
          helperText={form.formState.errors.host?.message}
        />
        <TextField
          {...form.register('port')}
          label="Port"
          type="number"
          error={!!form.formState.errors.port}
          helperText={form.formState.errors.port?.message}
        />
        <TextField
          {...form.register('user')}
          name="user"
          label={t`Email`}
          error={!!form.formState.errors.user}
          helperText={form.formState.errors.user?.message}
        />
        <TextField
          {...form.register('pass')}
          label={t`Password`}
          type="password"
          error={!!form.formState.errors.pass}
          helperText={form.formState.errors.pass?.message}
        />
        <TextField
          {...form.register('cc')}
          label={t`CC`}
          error={!!form.formState.errors.cc}
          helperText={form.formState.errors.cc?.message}
        />
        <ToggleField
          label={t`Use SSL`}
          helperText={t`Choose "Yes" to use SSL/TLS encryption from the start of the connection (typically with port 465). Choose "No" for unencrypted connections that may upgrade via STARTTLS (typically with port 587). This setting must match your email provider's requirements for the specified port, otherwise connection will fail.`}
          field="secure"
          form={form}
        />
      </div>

      <div className="flex flex-col gap-4 border border-gray-300 bg-gray-100 rounded p-2 shadow w-full">
        <FormLabel>{t`Email messages`}</FormLabel>
        <FormControl component="fieldset">
          <TextField
            {...form.register('sender')}
            className="component"
            label={t`Sender email address`}
            error={!!form.formState.errors.sender}
            helperText={
              form.formState.errors.sender
                ? form.formState.errors.sender?.message
                : t`The email address that will be used to send emails from the system.`
            }
          />
        </FormControl>
        <CollapsibleTextField
          label={t`Compiled shift changes`}
          field="collageMsg"
          form={form}
          helperText={t`Allowed dynamic values:\n{assigned} - The number of assigned shifts\n{update} - The number of updated shifts`}
        />
        <CollapsibleTextField
          label={t`Shift assigned`}
          field="assignedMsg"
          form={form}
        />
        <CollapsibleTextField
          label={t`Shift updated`}
          field="updateMsg"
          form={form}
        />
        <CollapsibleTextField
          label={t`Unconfirmed shift reminder`}
          field="reminderMsg"
          form={form}
        />
        <CollapsibleTextField
          label={t`Shift declined`}
          field="declineMsg"
          form={form}
          helperText={t`Allowed dynamic values:\n{user} - The user who declined\n{date} - The date of the user declining`}
        />
        <CollapsibleTextField
          label={t`Feedback received`}
          field="feedbackMsg"
          form={form}
          helperText={t`Allowed dynamic values:\n{user} - The user who gave feedback\n{feedback} - The feedback given by the user`}
        />
        <CollapsibleTextField
          label={t`Password reset link`}
          field="resetpassMsg"
          form={form}
          helperText={t`Allowed dynamic values:\n{token} - The password reset link token\n{date} - The date of the password reset link`}
        />
      </div>

      <div className="flex flex-col gap-4 border border-gray-300 bg-gray-100 rounded p-2 shadow w-full">
        <FormLabel>{t`Email queue settings`}</FormLabel>
        <ToggleField
          label={t`Enable email queue`}
          helperText={t`Enable email queueing, otherwise emails will be sent immediately. If this is enabled, emails will be sent at the time specified in the "Time for sending emails" field.`}
          field="shouldQueue"
          form={form}
        />
        <FormControl component="fieldset" className="mt-4!">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              className="component"
              label={t`Time for sending emails`}
              onChange={(date) =>
                form.setValue('sendPendingTime', date.toDate())
              }
              value={moment(form.watch('sendPendingTime'))}
            />
          </LocalizationProvider>
        </FormControl>
      </div>

      <div className="border border-gray-300 bg-gray-100 rounded p-2 shadow w-full">
        <Button
          id="send-pending-button"
          variant="contained"
          className="text-nowrap"
          style={{ color: 'black', backgroundColor: '#d1ccc2' }}
          onClick={() => sendPendingEmailsMutation.mutate()}
          disabled={sendPendingEmailsMutation.isLoading}
        >
          {sendPendingEmailsMutation.isLoading ? (
            <CircularProgress />
          ) : (
            t`Send messages`
          )}
        </Button>
        <FormHelperText className="helperText">
          {t`Force all pending emails to be sent immediately.`}
        </FormHelperText>
      </div>
      <div className="p-2 border-t border-gray-300 bg-gray-100 shadow w-full">
        <ToggleField
          label={t`Enable emails`}
          helperText={t`Enable email sending, otherwise emails will not be sent. WARNING: This will stop also password reset emails from being sent.`}
          field="shouldSend"
          form={form}
        />
      </div>
      <div className="group">
        <FormControl component="fieldset" className="component">
          <Button
            type="submit"
            variant="contained"
            style={{ color: 'black', backgroundColor: '#d1ccc2' }}
            disabled={emailSettingsMutation.isLoading}
          >
            {emailSettingsMutation.isLoading ? (
              <CircularProgress />
            ) : (
              t`Save settings`
            )}
          </Button>
        </FormControl>
      </div>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseNotification}
          severity={notification.type as AlertColor}
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>
    </form>
  );
};
