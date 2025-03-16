import { useLingui } from '@lingui/react/macro';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import axios from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import css from '../rangeofficer.module.scss';

const classes = classNames.bind(css);

export function OpenHoursSection({ date, hours, scheduleId }) {
  const { t } = useLingui();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState(
    new Date(
      0,
      0,
      0,
      hours.start?.split(':')[0] || 0,
      hours.start?.split(':')[1] || 0,
      0,
    ),
  );
  const [endTime, setEndTime] = useState(
    new Date(
      0,
      0,
      0,
      hours.end?.split(':')[0] || 0,
      hours.end?.split(':')[1] || 0,
      0,
    ),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setStartTime(
      new Date(
        0,
        0,
        0,
        hours.start?.split(':')[0] || 0,
        hours.start?.split(':')[1] || 0,
        0,
      ),
    );
    setEndTime(
      new Date(
        0,
        0,
        0,
        hours.end?.split(':')[0] || 0,
        hours.end?.split(':')[1] || 0,
        0,
      ),
    );
  }, [hours]);

  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: (data: { open: string; close: string }) => {
      return axios.put(`/api/schedule/${scheduleId}`, data);
    },
    onSuccess: (_, { open, close }) => {
      setDialogOpen(false);
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          open,
          close,
        };
      });
    },
  });

  const onTimeChange = useCallback(() => {
    if (startTime === null || endTime === null) {
      setErrorMessage(t`Invalid time selected.`);
      return;
    }
    const start = startTime.toTimeString().split(' ')[0].slice(0, 5);
    const end = endTime.toTimeString().split(' ')[0].slice(0, 5);
    scheduleMutation.mutate({ open: start, close: end });
  }, [startTime, endTime, scheduleMutation, t]);

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        <span className="text-2xl">{t`Open`}:</span>
        <Button
          size="medium"
          variant="outlined"
          className={classes(css.simpleButton)}
          onClick={() => setDialogOpen(true)}
        >
          {hours.start}-{hours.end}
        </Button>
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{t`Set opening hours`}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              closeOnSelect
              ampm={false}
              label={t`Start`}
              value={moment(startTime)}
              onChange={(time) => setStartTime(time.toDate())}
              minutesStep={5}
              className="mt-2!"
            />
            <TimePicker
              closeOnSelect
              ampm={false}
              label={t`End`}
              value={moment(endTime)}
              onChange={(time) => setEndTime(time.toDate())}
              minutesStep={5}
              className="mt-2!"
            />
          </LocalizationProvider>
          {errorMessage ? (
            <Typography color="error">{errorMessage}</Typography>
          ) : (
            ''
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            className={classes(css.cancelButtonStyle)}
          >
            {t`Cancel`}
          </Button>
          <Button
            onClick={onTimeChange}
            className={classes(css.saveButtonStyle, 'text-white!')}
          >
            {t`Save`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
