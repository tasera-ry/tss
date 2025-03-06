import { useState, useEffect, useMemo } from 'react';
import { useCookies } from 'react-cookie';

// Date handling
import moment from 'moment';

import api from '../../api/api';

// Login validation
import socketIOClient from 'socket.io-client';
import { validateLogin } from '../../utils/Utils';

// Receiving possible info messages
import InfoBox from '../../infoBox/InfoBox';
import { Devices } from './components/DeviceStatusPanel/DeviceStatusPanel';

import classNames from 'classnames';
import css from './rangeofficer.module.scss';
import { useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from 'react-query';
import { TrackCard } from '@/pages/TabletView/components/TrackCard';
import { OpenHoursSection } from '@/pages/TabletView/components/OpenHoursSection';
import { RangeOfficerStatusSection } from '@/pages/TabletView/components/RangeOfficerStatusSection';
import { Notifications } from '@/pages/TabletView/components/Notifications';

const classes = classNames.bind(css);


export function TabletView() {
  const { t, i18n } = useLingui();
  const [cookies] = useCookies(['username', 'role']);

  const [socket, setSocket] = useState();
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });

  const date = useMemo(() => moment(Date.now()).format('YYYY-MM-DD'), []);

  const queryClient = useQueryClient();

  const scheduleQuery = useQuery(
    ['schedule', date],
    async () => api.getSchedulingDate(date)
  );

  const {
    scheduleId,
    reservationId,
    rangeSupervision,
    rangeSupervisionScheduled: isScheduled
  } = scheduleQuery.data ?? {};

  const areTracksDisabled = rangeSupervision === 'closed';

  const hours = useMemo(() => {
    if (!scheduleQuery.data) return { start: '00:00', end: '00:00' };
    return {
      start: moment(scheduleQuery.data.open, 'h:mm').format('HH:mm'),
      end: moment(scheduleQuery.data.close, 'h:mm').format('HH:mm'),
    }
  }, [scheduleQuery.data])

  useEffect(() => {
    (async () => {
      const isLoginValid = await validateLogin();
      if (!isLoginValid) {
        RedirectToWeekview();
      }
      if (cookies.role !== 'rangemaster' && cookies.role !== 'superuser') {
        RedirectToWeekview();
      }
    })()

    const socketClient = socketIOClient()
    setSocket(socketClient)

    const onUpdate = (msg: any) => {
      queryClient.setQueryData(['schedule', date], (old: any) => {
        return {
          ...old,
          rangeSupervision: msg.status,
        }
      })
    }
    const onRefresh = () => {
      window.location.reload();
    }

    socketClient
      .on('rangeUpdate', onUpdate)
      .on('refresh', onRefresh)

    return () => {
      socketClient.off('rangeUpdate', onUpdate)
      socketClient.off('refresh', onRefresh)
    }
  }, [date]); // eslint-disable-line

  const formatedDate = useMemo(() => {
    return i18n.date(date, { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' })
  }, [date, i18n])

  return (
    <div>
      <InfoBox tabletMode={true} />
      <span className={classes(css.Text)}>{formatedDate}</span>
      <OpenHoursSection
        date={date}
        hours={hours}
        scheduleId={scheduleId}
      />

      <RangeOfficerStatusSection
        rangeSupervision={rangeSupervision}
        rangeSupervisionScheduled={isScheduled}
        reservationId={reservationId}
        scheduleId={scheduleId}
        socket={socket}
        date={date}
        setNotification={setNotification}
      />

      <span className={classes(css.Text)}>
        {t`Change track officer status by choosing color. Change number of track users with buttons`}
      </span>

      <div className={classes(css.trackRowStyle)}>
        {scheduleQuery.data?.tracks?.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            disabled={areTracksDisabled}
            scheduleId={scheduleId}
            date={date}
            socket={socket}
          />
        ))}
      </div>
      <Devices />
      <Notifications
        notification={notification}
        setNotification={setNotification}
      />
    </div>
  );
};

function RedirectToWeekview() {
  window.location.href = '/';
}
