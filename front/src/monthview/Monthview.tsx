import { useMemo, useCallback } from 'react';
import classNames from 'classnames';

// Material UI components
import { Link, useHistory, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

// Moment for date management
import moment from 'moment';
import {
  JumpToCurrent,
} from '../utils/Utils';
import { TableLegends } from '../TableLegends/TableLegends';
import { InfoBox } from '../pages/InfoMessageManagementView/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';

import smallInfoIcon from '@/assets/Small-info.png';
import { useQuery } from 'react-query';
import api from '@/api/api';
import { DaySchedule } from '@/types';
import { DateHeader } from '@/lib/components/DateHeader';
import { msg, t } from '@lingui/core/macro';
import { Trans } from '@lingui/react';

export function Monthview()  {

  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string}>()

  const targetDate = useMemo(() => {
    return dateParam ?? moment().format('YYYY-MM-DD');
  }, [dateParam])

  const { data: schedule, isSuccess } = useQuery({
    queryKey: ['monthview', targetDate],
    queryFn: async () => {
      const firstDay = moment(targetDate).startOf('month').startOf('isoWeek').format('YYYY-MM-DD')
      const lastDay = moment(targetDate).endOf('month').endOf('isoWeek').format('YYYY-MM-DD')
      const data = await api.getSchedulingFreeform(firstDay, lastDay) as DaySchedule[]
      const weeks = data.reduce((acc, day) => {
        const week = moment(day.date).isoWeek()
        if (!acc[week]) {
          acc[week] = []
        }
        acc[week].push(day)
        return acc
      }, {} as Record<number, DaySchedule[]>)
      return Object.entries(weeks).map(([week, days]) => ({
        week: Number(week),
        days: (days).sort((a, b) => a.date.localeCompare(b.date))
      }))
    }
  });
  console.log(schedule)
  const monthNro = useMemo(() => {
    // Months are padded to two characters
    return moment(targetDate).month().toString().padStart(2, '0');
  }, [targetDate])

  const yearNro = useMemo(() => {
    return moment(targetDate).year();
  }, [targetDate])

  const previousMonthClick = useCallback(() => {
    history.push(`/monthview/${moment(targetDate).subtract(1, 'month').format('YYYY-MM-DD')}`)
  }, [targetDate]);

  const nextMonthClick = useCallback(() => {
    history.push(`/monthview/${moment(targetDate).add(1, 'month').format('YYYY-MM-DD')}`)
  }, [targetDate]);

  return (
    <div>
      <InfoBox />
      <DateHeader targetDate={targetDate} onPrevious={previousMonthClick} onNext={nextMonthClick} />
      {isSuccess ? (
      <div className="flex flex-col items-center">
        <div className="w-[87.5%] flex justify-between">
          <JumpToCurrent />
          <ViewChanger />
        </div>
        <table className='w-[87.5%] bg-black-tint-70 border-separate border-spacing-2 table-fixed'>
          <TableHeader />
          <TableBody schedule={schedule}/>
        </table>  
      </div>
      ) : (
        <div className="flex justify-center h-40 items-center">
          <CircularProgress disableShrink />
        </div>
      )}
      <TableLegends />
    </div>
  );
}


const weekdays = [
  msg`Mon`,
  msg`Tue`,
  msg`Wed`,
  msg`Thu`,
  msg`Fri`,
  msg`Sat`,
  msg`Sun`
]


function TableHeader() {
  return (
    <thead>
      <tr className='text-white'>
        <th key="weekLabel">{t`Wk`}</th>
        {weekdays.map((day) => (
          <th key={`weekDayLabel-${day.id}`}><Trans id={day.id} /></th>
        ))}
      </tr>
    </thead>
  )
}

interface SchedyleWeek {
  week: number
  days: DaySchedule[]
}

function TableBody({schedule}: {schedule: SchedyleWeek[]}) {
  if (!schedule) return null

  return (
    <tbody>
      {schedule.map((week) => (
        <TableRow key={week.week} week={week.week} days={week.days} />
      ))}
    </tbody>
  )
}

interface TableRowProps {
  week: number
  days: DaySchedule[]
}

function TableRow({ week, days }: TableRowProps) {
  return (
    <tr className='h-16'>
      <td className='text-center text-white'>{week}</td>
      {days.map((day) => (
        <TableCell key={day.date} day={day} />
      ))}
    </tr>
  )
}

interface TableCellProps {
  day: DaySchedule
}

function TableCell({ day }: TableCellProps) {

  const date = useMemo(() => moment(day.date), [day])

  const isCurrent = useMemo(() => {
    return date.isSame(moment(), 'day') ? 'current' : ''
  }, [date])
  
  const color = useMemo(() => {
    switch (day.rangeSupervision) {
      case 'present':
        return "bg-green";
      case 'confirmed':
        return "bg-green-light"
      case 'not confirmed':
        return "bg-turquoise"
      case 'en route':
        return "bg-orange"
      case 'closed':
        return "bg-red-light"
      case 'absent':
        return "bg-black-tint-05"
      default:
        return "bg-blue"

    }
  }, [])

  const hasInfo = useMemo(() => {
    return day.tracks.some(track => track.notice !== null && track.notice !== '')
  }, [day.tracks])

  return (
    <td className={classNames('rounded relative', color)}>
     <Link
        key={`${isCurrent}-${day.date}`}
        className={classNames("size-full block text-center", isCurrent && "font-bold underline")}
        to={`/dayview/${day.date}`}
      >
        {date.date()}
      </Link>
      {hasInfo && (
        <img
          className="absolute top-1 right-1"
          src={smallInfoIcon}
          alt={t`Track has additional information`}
        />
      )}
    </td>
  )
}
