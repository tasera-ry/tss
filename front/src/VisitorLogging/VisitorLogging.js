import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import api from '../api/api';
import { getLanguage } from '../utils/Utils';
import texts from '../texts/texts.json';
import css from './VisitorLogging.module.scss';

const classes = classNames.bind(css);
const textLogs = texts.visitorLogging;

const VisitorLogging = ({
  handleClose,
  setToastSeverity,
  setToastMessage,
  setToastOpen,
}) => {
  const lang = localStorage.getItem('language');
  const [tracks, setTracks] = useState([]);
  const [date, setDate] = useState();

  useEffect(() => setDate(new Date()), []);

  useEffect(() => {
    (async () => {
      if (!date) return;
      const dateString = date.toISOString().split('T')[0];
      try {
        const data = await api.getSchedulingFreeform(dateString, dateString);
        setTracks(data[0].tracks);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [date]);

  const sendStats = async () => {
    try {
      const promises = tracks
        .filter(({ scheduled }) => scheduled)
        .map(({ scheduled, id }) => {
          const trackOpts = {
            scheduled_range_supervision_id:
              scheduled.scheduled_range_supervision_id,
            track_id: id,
            notice: scheduled.notice,
            track_supervisor: scheduled.track_supervisor,
            visitors: scheduled.visitors,
          };
          api.patchScheduledSupervisionTrack(
            scheduled.scheduled_range_supervision_id,
            id,
            trackOpts,
          );
        });
      await Promise.all(promises);

      setToastOpen(true);
      setToastSeverity('success');
      setToastMessage(textLogs.SuccessfullyUpdated[lang]);
      handleClose();
    } catch (error) {
      setToastSeverity('error');
      setToastMessage(error);
      setToastOpen(true);
    }
  };

  const handleChange = (event) => {
    const { target } = event;
    setTracks(
      tracks.map((track) =>
        track.id === parseInt(target.id)
          ? {
              ...track,
              scheduled: {
                ...track.scheduled,
                visitors: parseInt(target.value),
              },
            }
          : track,
      ),
    );
  };

  return (
    <div className={classes(css.loggingContainer)}>
      <div>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={getLanguage()}>
          <DatePicker
            closeOnSelect
            margin="normal"
            name="date"
            label={textLogs.DayChoose[lang]}
            value={date}
            onChange={(newDate) => setDate(newDate)}
            inputFormat="DD.MM.YYYY"
            renderInput={(params) => <TextField {...params} />}
            showTodayButton
            data-testid="datePicker"
          />
        </LocalizationProvider>
        {tracks[0] && tracks[0].id ? (
          <div className={classes(css.inputContainer)}>
            {tracks.map(({ id, short_description, scheduled }) => (
              <div key={id} className={classes(css.visitorInput)}>
                <TextField
                  id={id.toString()}
                  variant="outlined"
                  label={short_description}
                  type="number"
                  value={scheduled.visitors}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>{textLogs.NoSchedule[lang]}</div>
        )}
        <div className={classes(css.modalButtonContainer)}>
          <div className={classes(css.modalButton)}>
            <Button
              onClick={handleClose}
              variant="contained"
              color="secondary"
              style={{ color: 'black', backgroundColor: '#808080' }}
            >
              {textLogs.Close[lang]}
            </Button>
          </div>
          <div className={classes(css.modalButton)}>
            <Button
              onClick={sendStats}
              variant="contained"
              color="primary"
              style={{ color: 'black', backgroundColor: '#d1ccc2' }}
            >
              {textLogs.Save[lang]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorLogging;
