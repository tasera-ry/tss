import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import api from '../api/api';
import css from './Trackview.module.scss';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useWeekDay } from '../utils/dateUtils';

const classes = classNames.bind(css);

const getRangeStatus = (rangeSupervision) => {
  switch (rangeSupervision) {
    case 'present':
      return { status: 'available', text: t`Range officer present` };
    case 'absent':
      return { status: 'unavailable', text: t`Range officer undefined` };
    case 'confirmed':
      return { status: 'confirmed', text: t`Range officer confirmed` };
    case 'not confirmed':
      return { status: 'notConfirmed', text: t`Range officer predefined` };
    case 'en route':
      return { status: 'enRoute', text: t`Range officer on the way` };
    default:
      return { status: 'closed', text: t`Range officer not present` };
  }
};

const getTrackAvailability = (trackSupervision) => {
  switch (trackSupervision) {
    case 'present':
      return { status: 'available', text: t`Track officer present` };
    case 'absent':
      return { status: 'unavailable', text: t`No defined track officer` };
    default:
      return { status: 'closed', text: t`Range closed` };
  }
};

const Trackview = (props) => {
  const { t } = useLingui();
  const { date: targetDate, track } = useParams();

  const [state, setState] = useState({
    date: new Date(Date.now()),
    opens: 16,
    closes: 20,
    rangeSupervision: false,
    trackSupervision: false,
    info: '',
    parent: props.getParent,
    name: 'rata 1',
    description: '',
  });
  const [visible, setVisible] = useState({
    date: false,
    supervisors: false,
    infobox: false,
  });

  useEffect(() => {
    // /dayview/2020-02-20
    const request = async () => {
      try {
        const data = await api.getSchedulingDate(date);
        const selectedTrack = data.tracks.find((item) => item.name === track);

        if (selectedTrack === undefined) {
          setState({
            ...state,
            name: t`Track cannot be found.`,
          });
          setVisible({
            date: false,
            supervisors: false,
            infobox: false,
          });
          return;
        }

        setState({
          ...state,
          date: new Date(data.date),
          trackSupervision: selectedTrack.trackSupervision,
          rangeSupervision: data.rangeSupervision,
          name: selectedTrack.name,
          description: `(${selectedTrack.description})`,
          info: selectedTrack.notice, // ensure line breaks
        });
        setVisible({
          date: true,
          supervisors: true,
          infobox: selectedTrack.notice.length > 0 ? true : false,
        });
      } catch (err) {
        console.log(err);
      }
    };
    request();
  }, [props]);

  const rangeStatus = getRangeStatus(state.rangeSupervision);
  const trackAvailability = getTrackAvailability(state.trackSupervision);

  const date = useMemo(() => new Date(targetDate), [targetDate])
  const weekDay = useWeekDay(date)

  return (
    <div className={classes(css.wholeScreenDiv)}>
      <div className={classes(css.trackNameAndType)}>
        <div>
          <h1>{state.name}</h1>
        </div>
        <div>
          <h3> {state.description}</h3>
        </div>
      </div>
      {visible.date && (
        <div>
          <h2>
            {weekDay}{' '}
            {state.date.toLocaleDateString('fi-FI')}
          </h2>
        </div>
      )}
      {visible.supervisors && ( // state of range officer and range
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="left"
          spacing={1}
        >
          <Grid item xs={1} sm={6}>
            {
              <Box
                className={classes(css.trackStyles, css[rangeStatus.status])}
              >
                {rangeStatus.text}
              </Box>
            }
          </Grid>
          <Grid item xs={1} sm={6}>
            <Box
              className={classes(
                css.trackStyles,
                css[trackAvailability.status],
              )}
            >
              {trackAvailability.text}
            </Box>
          </Grid>
        </Grid>
      )}
      {visible.infobox && ( // extra info of the track
        <div className={classes(css.preWrap)}>
          <p>{t`Info`}:</p>
          <div className={classes(css.infoBox)}>{state.info}</div>
        </div>
      )}
      <Link
        className={classes(css.backLink)}
        to={`/dayview/${state.date.getFullYear()}-${
          state.date.getMonth() + 1
        }-${state.date.getDate()}`}
      >
        <ArrowBackIcon />
        {t`Back to dayview`}
      </Link>
    </div>
  );
};

export default Trackview;
