import React, { useState, useEffect } from 'react';
import './VisitorLogging.css';
import MomentUtils from '@date-io/moment';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import api from '../api/api';
import { visitorLogging as texts } from '../texts/texts.json';

const VisitorLogging = ({
  handleClose,
  setToastSeverity,
  setToastMessage,
  setToastOpen,
}) => {
  const lang = localStorage.getItem('language');
  const [tracks, setTracks] = useState([]);
  const [date, setDate] = useState();

  useEffect(() => {
    const currentDate = new Date();
    setDate(currentDate);
  }, []);

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

  const sendStats = () => {
    try {
      tracks.forEach(async ({ scheduled, id }) => {
        if (!scheduled) return;
        const trackOpts = {
          scheduled_range_supervision_id:
            scheduled.scheduled_range_supervision_id,
          track_id: id,
          notice: scheduled.notice,
          track_supervisor: scheduled.track_supervisor,
          visitors: scheduled.visitors,
        };
        await api.patchScheduledSupervisionTrack(
          scheduled.scheduled_range_supervision_id,
          id,
          trackOpts,
        );
      });
    } catch (error) {
      setToastSeverity('error');
      setToastMessage(error);
      setToastOpen(true);
    } finally {
      setToastOpen(true);
      setToastSeverity('success');
      setToastMessage(texts.SuccessfullyUpdated[lang]);
      handleClose();
    }
  };

  const handleChange = (event) => {
    const { target } = event;
    setTracks(
      tracks.map((track) => {
        if (track.id === parseInt(target.id)) {
          return {
            ...track,
            scheduled: {
              ...track.scheduled,
              visitors: parseInt(target.value),
            },
          };
        }
        return track;
      }),
    );
  };

  let locale = 'fi';
  if (localStorage.getItem('language') === '0') {
    locale = 'fi';
  } else if (localStorage.getItem('language') === '1') {
    locale = 'en';
  }
  return (
    <div className="loggingContainer">
      <div>
        <MuiPickersUtilsProvider locale={locale} utils={MomentUtils}>
          <KeyboardDatePicker
            autoOk
            margin="normal"
            name="date"
            label={texts.DayChoose[lang]}
            value={date}
            onChange={(newDate) => setDate(newDate)}
            format="DD.MM.YYYY"
            showTodayButton
            data-testid="datePicker"
          />
        </MuiPickersUtilsProvider>
        {tracks[0] && tracks[0].id ? (
          <div className="inputContainer">
            {tracks.map((track) => (
              <div key={track.id} className="visitorInput">
                <TextField
                  id={track.id.toString()}
                  variant="outlined"
                  label={track.short_description}
                  type="number"
                  value={track.scheduled.visitors}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>{texts.NoSchedule[lang]}</div>
        )}
        <div className="modalButtonContainer">
          <div className="modalButton">
            <Button onClick={handleClose} variant="contained" color="secondary">
              {texts.Close[lang]}
            </Button>
          </div>
          <div className="modalButton">
            <Button onClick={sendStats} variant="contained" color="primary">
              {texts.Save[lang]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorLogging;
