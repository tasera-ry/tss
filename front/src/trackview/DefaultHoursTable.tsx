import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  AlertColor,
} from '@mui/material';

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';

import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { useLingui } from '@lingui/react/macro';

export const weekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
import { useQuery } from 'react-query';

export const DefaultHoursTable = () => {
  const { t } = useLingui();

  const { data: fetchedDefaultHours, isLoading } = useQuery(
    'fetchDefaultHours',
    async () => {
      const response = await fetch('/api/default-hours');
      if (!response.ok) {
        throw new Error('Failed to fetch default hours');
      }
      return response.json();
    },
    {
      onSuccess: (data) => {
        const defHours = () => {
          return data.reduce((acc, dayHours) => {
            acc[dayHours.day] = {
              open: moment(dayHours.open, 'HH:mm'),
              close: moment(dayHours.close, 'HH:mm'),
            };
            return acc;
          }, {});
        };

        setDefaultHours(defHours());
      },
      onError: (error) => {
        console.error(error);
        setToast({
          open: true,
          message: t`Failed to fetch default hours`,
          severity: 'error',
        });
      },
    },
  );

  const [defaultHours, setDefaultHours] = useState<
    Record<string, { open: moment.Moment; close: moment.Moment }>
  >({});

  const handleTimeChange = (
    day: string,
    type: 'open' | 'close',
    newTime: moment.Moment | null,
  ) => {
    if (newTime) {
      setDefaultHours((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [type]: newTime,
        },
      }));
    }
  };

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { refetch: saveDefaultHours } = useQuery(
    'saveDefaultHours',
    async () => {
      const response = await fetch('/api/default-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          default_hours: Object.fromEntries(
            weekdays.map((day) => [
              day,
              {
                open: defaultHours[day].open.format('HH:mm'),
                close: defaultHours[day].close.format('HH:mm'),
              },
            ]),
          ),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save default hours');
      }

      return response.json();
    },
    {
      enabled: false, // Disable automatic execution
      onSuccess: () => {
        setToast({
          open: true,
          message: t`Default hours saved`,
          severity: 'success',
        });
      },
      onError: (error) => {
        console.error(error);
        setToast({
          open: true,
          message: t`Failed to save default hours`,
          severity: 'error',
        });
      },
    },
  );

  if (isLoading) {
    return <div>{t`Loading...`}</div>;
  }

  return (
    <ScopedCssBaseline>
      {/* {trackQuery.isLoading && <LinearProgress variant="query" />} */}
      <div className="p-4 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-center">{t`Default hours`}</h1>
        <div className="max-w-screen-lg rounded-lg border border-gray-300 bg-white shadow-md">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t`Weekday`}</TableCell>
                <TableCell>{t`Opening`}</TableCell>
                <TableCell>{t`Closing`}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weekdays.map((day) => (
                <TableRow key={day}>
                  <TableCell>
                    {t`${day.charAt(0).toUpperCase() + day.slice(1)}`}
                  </TableCell>
                  <TableCell>
                    <LocalizationProvider
                      dateAdapter={AdapterMoment}
                      adapterLocale="fi"
                    >
                      <TimePicker
                        value={
                          defaultHours[day]?.open ?? moment().hour(17).minute(0)
                        }
                        onChange={(newTime) =>
                          handleTimeChange(day, 'open', newTime)
                        }
                        minutesStep={5}
                        ampm={false}
                        slots={{ textField: TextField }}
                      />
                    </LocalizationProvider>
                  </TableCell>
                  <TableCell>
                    <LocalizationProvider
                      dateAdapter={AdapterMoment}
                      adapterLocale="fi"
                    >
                      <TimePicker
                        value={
                          defaultHours[day]?.close ??
                          moment().hour(20).minute(0)
                        }
                        onChange={(newTime) =>
                          handleTimeChange(day, 'close', newTime)
                        }
                        minutesStep={5}
                        ampm={false}
                        slots={{ textField: TextField }}
                      />
                    </LocalizationProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex w-full justify-center items-center">
            <Button
              className="w-full"
              variant="contained"
              onClick={() => {
                saveDefaultHours();
              }}
              style={{ backgroundColor: '#d1ccc2' }}
            >
              {t`Save All`}
            </Button>
          </div>
        </div>
        <Snackbar
          open={toast.open}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          autoHideDuration={3000}
        >
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </div>
    </ScopedCssBaseline>
  );
};
