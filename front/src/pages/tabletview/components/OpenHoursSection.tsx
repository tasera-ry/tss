import { useLingui } from "@lingui/react/macro";
import { Button, Dialog, DialogTitle, DialogContent, Typography, DialogActions } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import axios from "axios";
import moment from "moment";
import { useState, useCallback } from "react";
import { useQueryClient, useMutation } from "react-query";
import classNames from 'classnames';

import css from '../rangeofficer.module.scss';

const classes = classNames.bind(css);

export function OpenHoursSection({ date, hours, scheduleId }) {
  const { t } = useLingui();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState(new Date(0, 0, 0, hours.start?.split(':')[0] || 0, hours.start?.split(':')[1] || 0, 0));
  const [endTime, setEndTime] = useState(new Date(0, 0, 0, hours.end?.split(':')[0] || 0, hours.end?.split(':')[1] || 0, 0));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: (data: { open: string, close: string }) => {
      return axios.put(`/api/schedule/${scheduleId}`, data);
    },
    onSuccess: (_, { open, close }) => {
      setDialogOpen(false);
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          open,
          close,
        }
      });
    }
  })

  const onTimeChange = useCallback(() => {
    if (startTime === null || endTime === null) {
      setErrorMessage(t`"Invalid time selected.`);
      return;
    }
    const start = startTime.toTimeString().split(' ')[0].slice(0, 5);
    const end = endTime.toTimeString().split(' ')[0].slice(0, 5);
    scheduleMutation.mutate({ open: start, close: end });
  }, [startTime, endTime, scheduleMutation, t])

  return (<>
    <div className='flex items-center justify-center gap-4'>
      <span className='text-2xl'>
        {t`Open`}:
      </span>
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
          // renderInput={(params) => <TextField {...params} />}
          // showTodayButton
          />
          <TimePicker
            closeOnSelect
            ampm={false}
            label={t`End`}
            value={moment(endTime)}
            onChange={(time) => setEndTime(time.toDate())}
            minutesStep={5}
          // renderInput={(params) => <TextField {...params} />}
          // showTodayButton
          />
        </LocalizationProvider>
        {errorMessage ? <Typography color="error">{errorMessage}</Typography> : ''}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)} className={classes(css.cancelButtonStyle)}>
          {t`Cancel`}
        </Button>
        <Button onClick={onTimeChange} className={classes(css.saveButtonStyle)}>
          {t`Save`}
        </Button>
      </DialogActions>
    </Dialog>
  </>
  )
}
