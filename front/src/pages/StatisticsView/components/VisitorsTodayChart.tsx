import colors from '@/colors.module.scss';
import { schedulingFreeformQuery } from '@/pages/StatisticsView/components/schedulingFreeformQuery';
import { useLingui } from '@lingui/react/macro';
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useQuery } from 'react-query';

interface VisitorsTodayChartProps {
  date: moment.Moment;
}

export function VisitorsTodayChart({ date }: VisitorsTodayChartProps) {
  const { t } = useLingui();

  const monthDays = useMemo(() => {
    const lastDate = moment(date).endOf('month').date();
    return new Array(lastDate).fill(0).map((_, i) => i + 1);
  }, [date]);

  const visitorsQuery = useQuery({
    queryKey: ['schedulingFreeformMonth', date.format('YYYY-MM-DD')],
    queryFn: schedulingFreeformQuery,
    select: (data) => {
      return data.map(({ scheduleId, tracks }) => {
        if (!scheduleId) return 0;
        return tracks.reduce(
          (total, { scheduled }) => total + scheduled.visitors,
          0,
        );
      });
    },
  });

  const isPending = visitorsQuery.isLoading;

  if (isPending)
    return (
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-bold">{t`Visitors today`}</h3>
        <CircularProgress />
      </div>
    );

  return (
    <div>
      <h3 className="text-xl font-bold">{t`Visitors today`}</h3>
      <Chart
        options={{
          chart: {
            id: 'monthChart',
          },
          stroke: {
            curve: 'smooth',
            colors: [colors.green],
          },
          xaxis: {
            categories: monthDays,
          },
          yaxis: {
            title: {
              text: t`Number of visitors`,
              style: {
                fontSize: '14px',
              },
            },
          },
        }}
        series={[
          {
            name: 'visitors',
            data: visitorsQuery.data ?? [],
          },
        ]}
        type="line"
        width="700"
        height="400"
      />
    </div>
  );
}
