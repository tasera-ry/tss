import React, { useState, useEffect } from 'react';
import './VisitorLogging.css';
import axios from 'axios';
import MomentUtils from '@date-io/moment';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { getLanguage } from '../utils/Utils';
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
    const getTracks = async () => {
      if (date) {
        const dateString = date.toISOString().split('T')[0];
        const query = `api/daterange/freeform/${dateString}/${dateString}`;
        const response = await axios.get(query);
        if (response) {
          setTracks(response.data[0].tracks);
        }
      }
    };
    getTracks();
  }, [date]);

  const sendStats = () => {
    try {
      tracks.forEach(async (track) => {
        if (track.scheduled) {
          const trackOpts = {
            scheduled_range_supervision_id:
              track.scheduled.scheduled_range_supervision_id,
            track_id: track.id,
            notice: track.scheduled.notice,
            track_supervisor: track.scheduled.track_supervisor,
            visitors: track.scheduled.visitors,
          };
          await axios.put(
            `/api/track-supervision/${track.scheduled.scheduled_range_supervision_id}/${track.id}`,
            trackOpts,
          );
        }
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

  const locale = getLanguage();
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
