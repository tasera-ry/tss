import { schedulingFreeformQuery } from "@/pages/StatisticsView/components/schedulingFreeformQuery";
import { useLingui } from "@lingui/react/macro";
import { CircularProgress } from "@mui/material";
import { useQuery } from "react-query";
import Chart from 'react-apexcharts';
import colors from '@/colors.module.scss';

interface MonthlyVisitorsByTrackChartProps {
  date: moment.Moment;
}

export function MonthlyVisitorsByTrackChart({ date }: MonthlyVisitorsByTrackChartProps) {

  const { t } = useLingui()

  const trackQuery = useQuery({
    queryKey: ['schedulingFreeformMonth', date],
    queryFn: schedulingFreeformQuery,
    select: (data) => {
      const tracks = data
        .filter((supervision) => supervision.scheduleId)
        .reduce((acc, supervision) => {
          supervision.tracks.forEach((track) => acc.add(track.short_description))
          return acc;
        }, new Set<string>())

      const visitors = data
        .filter((supervision) => supervision.scheduleId)
        .reduce((acc, supervision) => {
          supervision.tracks.forEach(({ id, scheduled }) => {
            if (acc.length !== 7) {
              acc.splice(id - 1, 1, scheduled.visitors);
            } else {
              const trackPerMonthVisitors = acc[id - 1];
              const trackVisitors = scheduled.visitors + trackPerMonthVisitors;
              acc.splice(id - 1, 1, trackVisitors);
            }
          })
          return acc;
        }, [])

      return {
        tracks: Array.from(tracks.values()),
        visitors,
      };
    },
  })

  const isPending = trackQuery.isLoading

  if (isPending) return (
    <div className='flex flex-col items-center gap-2'>
      <h3 className='text-xl font-bold'>{t`Monthly visitors per track`}</h3>
      <CircularProgress />
    </div>
  )

  return (
    <div>
      <h3 className='text-xl font-bold'>{t`Monthly visitors per track`}</h3>
      <Chart
        options={{
          chart: {
            id: 'monthlyTrackChart',
          },
          dataLabels: {
            enabled: true,
            background: {
              enabled: true,
            },
            style: {
              colors: [colors.green],
              fontSize: '16px',
            }
          },
          fill: {
            colors: [colors.green],
          },
          xaxis: {
            categories: trackQuery.data?.tracks ?? [],
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
            data: trackQuery.data?.visitors ?? [],
          }
        ]}
        type="bar"
        width="700"
        height="400"
      />
    </div>
  )
}
