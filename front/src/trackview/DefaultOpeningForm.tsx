import { Box, Button } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import moment from 'moment';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';

export const DefaultOpeningForm = () => {
  const { t } = useLingui();

  const [defaultOpen, setDefaultOpen] = useState(
    moment().hour(17).minute(0).second(0),
  );
  const [defaultClose, setDefaultClose] = useState(
    moment().hour(20).minute(0).second(0),
  );

  // TODO use query
  const saveDefaultHours = async () => {
    try {
      const response = await fetch('/api/default-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          open: moment(defaultOpen).format('HH:mm'),
          close: moment(defaultClose).format('HH:mm'),
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // TODO different default hours for different days
  const dates = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return (
    <Box className="defaultHoursSection">
      <h3>{t`Default Hours`}</h3>
      <div className="timePicker">
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fi">
          <TimePicker
            label={t`Default Open`}
            value={defaultOpen}
            onChange={(newTime) => setDefaultOpen(newTime)}
            minutesStep={5}
            ampm={false}
            slots={{ textField: TextField }}
          />
        </LocalizationProvider>
        <div className="dash">-</div>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fi">
          <TimePicker
            label={t`Default Close`}
            value={defaultClose}
            onChange={(newTime) => setDefaultClose(newTime)}
            minutesStep={5}
            ampm={false}
            slots={{ textField: TextField }}
          />
        </LocalizationProvider>
      </div>
      <Button
        variant="contained"
        onClick={saveDefaultHours}
        style={{ backgroundColor: '#d1ccc2' }}
      >
        {t`Save Default Hours`}
      </Button>
    </Box>
  );
};
