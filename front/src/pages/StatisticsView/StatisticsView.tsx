import { useCallback, useMemo } from 'react';

import moment from 'moment';
import 'moment/locale/fi';

import { useLanguageContext } from '@/i18n';
import { DateHeader } from '@/lib/components/DateHeader';
import { CurrentDayStatistics } from '@/pages/StatisticsView/components/CurrentDayStatistics';
import { MonthlyVisitorsByTrackChart } from '@/pages/StatisticsView/components/MonthlyVisitorsByTrackChart';
import { VisitorsTodayChart } from '@/pages/StatisticsView/components/VisitorsTodayChart';
import { schedulingFreeformQuery } from '@/pages/StatisticsView/components/schedulingFreeformQuery';
import { Trans, useLingui } from '@lingui/react/macro';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router';

export const StatisticsView = () => {
  const { t, i18n } = useLingui();
  const [locale] = useLanguageContext();

  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string }>();

  const date = useMemo(() => {
    if (dateParam) {
      return moment(dateParam);
    }
    return moment();
  }, [dateParam]);

  const monthQuery = useQuery(
    ['schedulingFreeformMonth', date],
    schedulingFreeformQuery,
    {
      select: (data) => {
        const monthVisitors = data.map(({ scheduleId, tracks }) => {
          if (!scheduleId) return 0;
          return tracks.reduce(
            (total, { scheduled }) => total + scheduled.visitors,
            0,
          );
        });
        const currentDay = moment(date).date();
        return {
          totalVisitors: monthVisitors.reduce((a, b) => a + b, 0),
          totalVisitorsForDay: monthVisitors[currentDay - 1],
        };
      },
    },
  );

  const onDateChange = useCallback(
    (newDate: moment.Moment) => {
      history.replace(`/statistics/${newDate.format('YYYY-MM-DD')}`);
    },
    [history],
  );

  const formatedMonth = useMemo(() => {
    return i18n.date(date.toDate(), { month: 'long', year: 'numeric' });
  }, [date]);

  const formatedDay = useMemo(() => {
    return i18n.date(date.toDate(), {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }, [date]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={locale}>
        <DatePicker
          closeOnSelect
          label={t`Choose date`}
          value={moment(date)}
          onAccept={(newDate) => onDateChange(newDate)}
        />
      </LocalizationProvider>
      <DateHeader
        targetDate={moment(date).format('YYYY-MM-DD')}
        onPrevious={() => onDateChange(date.subtract(1, 'day'))}
        onNext={() => onDateChange(date.add(1, 'day'))}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold">{t`Day`}</h2>
          <span>
            <Trans>
              Visitors in total {formatedDay}:{' '}
              {monthQuery.data?.totalVisitorsForDay ?? 0}
            </Trans>
          </span>
        </div>
        <CurrentDayStatistics date={date} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold">{t`Month`}</h2>
          <span>
            <Trans>
              Visitors in total {formatedMonth}:{' '}
              {monthQuery.data?.totalVisitors ?? 0}
            </Trans>
          </span>
        </div>
        <VisitorsTodayChart date={date} />
        <MonthlyVisitorsByTrackChart date={date} />
      </div>
    </div>
  );
};
