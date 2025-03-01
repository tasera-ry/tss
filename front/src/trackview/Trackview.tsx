import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import api from '../api/api';
import css from './Trackview.module.scss';
import { t } from '@lingui/core/macro';
import { useWeekDay } from '../utils/dateUtils';
import { useQuery } from 'react-query';
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import classNames from 'classnames';
import { useLingui } from '@lingui/react/macro';


export function Trackview() {
  const { t } = useLingui();
  const { date: targetDate, track } = useParams<{ date: string, track: string }>();

  const { data: schedule, status } = useQuery({
    queryKey: ['trackview', targetDate],
    queryFn: () => api.getSchedulingDate(targetDate),
    enabled: !!targetDate,
  })

  const selectedTrack = useMemo(() => {
    return schedule?.tracks.find((item) => item.name === track);
  }, [schedule, track])

  const rangeStatus = getRangeStatus(schedule?.rangeSupervision ?? '');
  const trackAvailability = getTrackAvailability(selectedTrack?.trackSupervision ?? '');

  const date = useMemo(() => new Date(targetDate), [targetDate])
  const weekDay = useWeekDay(date, 'short')

  if (status === 'error') {
    return (
      <TrackViewContainer className='h-screen'>
        <h1 className='text-bold text-2xl'>{t`Error`}</h1>
        <p>{t`Something went wrong. Please try again later.`}</p>
      </TrackViewContainer>
    )
  }

  if (status === 'loading') {
    return (
      <TrackViewContainer className='h-screen'>
        <CircularProgress />
        <span>{t`Loading...`}</span>
      </TrackViewContainer>
    )
  }

  if (!schedule) {
    return (
      <TrackViewContainer className='h-screen'>
        <h1 className='text-bold text-2xl'>{t`Track cannot be found.`}</h1>
      </TrackViewContainer>
    )
  }

  return (
    <TrackViewContainer >
      <div className="flex flex-col items-center">
        <h1 className='text-2xl font-bold'>{selectedTrack.name}</h1>
        <span> {selectedTrack.description}</span>
      </div>
      <span>
        {`${weekDay} ${date.toLocaleDateString('fi-FI')}`}
      </span>
      <ColoredBox
        status={rangeStatus.status}
      >
        {rangeStatus.text}
      </ColoredBox>
      <ColoredBox
        status={trackAvailability.status}
      >
        {trackAvailability.text}
      </ColoredBox>
      {selectedTrack.notice && (
        <div className="bg-black-tint-20 p-3 rounded-lg border border-black max-w-[50%]">
          <p className="font-bold">{t`Info`}:</p>
          <div>{selectedTrack.notice}</div>
        </div>
      )}
    </TrackViewContainer>
  );
};

function TrackViewContainer({ className, children }: { className?: string, children: React.ReactNode }) {
  const { date: targetDate } = useParams<{ date: string, track: string }>();
  const date = useMemo(() => new Date(targetDate), [targetDate])
  return (
    <div className={classNames('relative flex flex-col items-center justify-center gap-2 pt-12', className)}>
      <BackLink date={date} />
      {children}
    </div>
  )
}


function getRangeStatus(rangeSupervision: string) {
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

function getTrackAvailability(trackSupervision: string) {
  switch (trackSupervision) {
    case 'present':
      return { status: 'available', text: t`Track officer present` };
    case 'absent':
      return { status: 'unavailable', text: t`No defined track officer` };
    default:
      return { status: 'closed', text: t`Range closed` };
  }
};

function ColoredBox({ status, children }: { status: string, children: React.ReactNode }) {
  return (
    <span
      className={classNames(
        "p-3 w-[60%] text-center font-bold text-xl",
        css[status],
      )}
    >
      {children}
    </span>
  )
}
function BackLink({ date }: { date: Date }) {
  const { t } = useLingui();
  return (
    <Link
      className="flex items-center gap-2 absolute top-0 left-0 p-4 hover:scale-105"
      to={`/dayview/${moment(date).format('YYYY-MM-DD')}`}
    >
      <ArrowBackIcon />
      {t`Back to dayview`}
    </Link>
  )
}
