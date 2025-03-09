import { schedulingFreeformQuery } from "@/pages/StatisticsView/components/schedulingFreeformQuery";
import { useLingui } from "@lingui/react/macro";
import { CircularProgress } from "@mui/material";
import { useQuery } from "react-query";
import Chart from 'react-apexcharts';
import api from "@/api/api";
import colors from '@/colors.module.scss';


interface CurrentDayStatisticsProps {
  date: moment.Moment;
}

export function CurrentDayStatistics({ date }: CurrentDayStatisticsProps) {
  const { t } = useLingui()

  const dayQuery = useQuery({
    queryKey: ['schedulingFreeformDay', date.format('YYYY-MM-DD')],
    queryFn: async () => {
      const data = await api.getSchedulingFreeform(date, date);
      const visitors = [];
      data.forEach(({ scheduleId, tracks }) => {
        if (!scheduleId) visitors.push(0);
        else tracks.forEach(({ scheduled }) => visitors.push(scheduled.visitors ?? 0));
      });
      return visitors;
    }
  })
  const trackQuery = useQuery({
    queryKey: ['schedulingFreeformMonth', date.format('YYYY-MM-DD')],
    queryFn: schedulingFreeformQuery,
    select: (data) => {
      const tracks = data
        .filter((supervision) => supervision.scheduleId)
        .reduce((acc, supervision) => {
          supervision.tracks.forEach((track) => acc.add(track.short_description))
          return acc;
        }, new Set<string>())

      return {
        tracks: Array.from(tracks.values()),
      };
    },
  })

  const isPending = dayQuery.isLoading || trackQuery.isLoading

  if (isPending) return (
    <div className='flex flex-col items-center gap-2'>
      <h3 className='text-xl font-bold'>{t`Visitors per track`}</h3>
      <CircularProgress />
    </div>
  )

  return (
    <div>
      <h3 className='text-xl font-bold'>{t`Visitors per track`}</h3>
      <Chart
        options={{
          chart: {
            id: 'dayChart',
          },
          dataLabels: {
            enabled: true,
            background: {
              enabled: true,
            },
            style: {
              colors: [colors.green],
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
        series={[{
          name: 'visitors',
          data: dayQuery.data ?? []
        }]}
        type="bar"
        width="700"
        height="400"
      />
    </div>
  )
}
