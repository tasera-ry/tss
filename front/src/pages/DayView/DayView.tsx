import classNames from 'classnames';
import { useMemo } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
// Material UI components
import { Link, useHistory, useParams } from 'react-router-dom';

import api from '@/api/api';
import info from '@/assets/Info.png';
import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import { JumpToCurrent } from '@/utils/Utils';
import { Trans, useLingui } from '@lingui/react/macro';
// Moment for date handling
import moment from 'moment';
import { useQuery } from 'react-query';
import { DeviceStatusList } from '../../DeviceStatusList/DeviceStatusList';
import css from './DayView.module.scss';

const classes = classNames.bind(css);

export function Dayview() {
  const { t } = useLingui();
  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string }>();

  const targetDate = useMemo(() => {
    return dateParam ?? moment().format('YYYY-MM-DD');
  }, [dateParam]);

  const { data } = useQuery({
    queryKey: ['dayview', targetDate],
    queryFn: () => api.getSchedulingDate(targetDate),
  });

  const previousDayClick = () => {
    history.push(
      `/dayview/${moment(targetDate).subtract(1, 'day').format('YYYY-MM-DD')}`,
    );
  };

  const nextDayClick = () => {
    history.push(
      `/dayview/${moment(targetDate).add(1, 'day').format('YYYY-MM-DD')}`,
    );
  };

  const opensAt = useMemo(() => {
    if (!data?.open) return undefined;
    return moment(data.open, 'HH:mm').format('H.mm');
  }, [data]);

  const closesAt = useMemo(() => {
    if (!data?.close) return undefined;
    return moment(data.close, 'HH:mm').format('H.mm');
  }, [data]);

  return (
    <div>
      <InfoBox tabletMode={true} />
      <div className={classes(css.dayviewContainer)}>
        <DateHeader
          targetDate={targetDate}
          onPrevious={previousDayClick}
          onNext={nextDayClick}
        />
        {data && <OfficerBanner rangeSupervision={data.rangeSupervision} />}
        {closesAt && opensAt && (
          <h2 className={classes(css.headerText)}>
            <Trans>
              Opening hours: {opensAt}-{closesAt}
            </Trans>
          </h2>
        )}
        {/* Whole view */}
        <div className={classes(css.dayviewBigContainer)}>
          <div className={classes(css.viewChanger)}>
            <div className={classes(css.viewChangerCurrent)}>
              <JumpToCurrent />
            </div>
            <ViewChanger />
          </div>
          <div className="flex bg-black-tint-70">
            {!data ? (
              <CircularProgress disableShrink />
            ) : (
              <TrackList tracks={data.tracks} date={targetDate} />
            )}
            {/* <ButtonComponent /> */}
            <DeviceStatusList />
          </div>
        </div>
        <Link
          className="flex items-center gap-1 mt-5 pb-2 pl-2"
          to={`/weekview/${targetDate}`}
        >
          <ArrowBackIcon />
          <Trans>Back to weekview</Trans>
        </Link>

        <hr />
        <Legends />
      </div>
    </div>
  );
}

export default Dayview;

function TrackList({ tracks, date }) {
  return (
    <div className="flex p-2 gap-2">
      {tracks.map((track) => (
        <TrackBox key={track.id} track={track} date={date} />
      ))}
    </div>
  );
}

function TrackBox({ track, date }) {
  const { t } = useLingui();

  const color = useMemo(() => {
    switch (track.trackSupervision) {
      case 'present':
        return css.greenB;
      case 'absent':
        return css.whiteB;
      case 'confirmed':
        return css.lightGreenB;
      case 'not confirmed':
        return css.blueB;
      case 'en route':
        return css.yellowB;
      case 'closed':
        return css.redB;
      default:
        break;
    }
  }, [track]);

  const link = `/trackview/${date}/${track.name}`;

  return (
    <Link
      className={classes('rounded p-2 flex flex-col justify-start', color)}
      to={link}
    >
      <span className={classes(css.bold)}>{track.name}</span>
      <span className={classes(css.overflowHidden)}>
        {track.short_description}
      </span>
      {track.notice.length > 0 && (
        <img
          className="size-11 self-center mt-auto"
          src={info}
          alt={t`Track has additional information`}
        />
      )}
    </Link>
  );
}

function OfficerBanner({ rangeSupervision }) {
  const { t } = useLingui();

  const { text, color } = useMemo(() => {
    switch (rangeSupervision) {
      case 'present':
        return { text: t`Range officer present`, color: css.greenB };
      case 'absent':
        return { text: t`Range officer undefined`, color: css.whiteB };
      case 'confirmed':
        return { text: t`Range officer confirmed`, color: css.lightGreenB };
      case 'not confirmed':
        return { text: t`Range officer predefined`, color: css.blueB };
      case 'en route':
        return { text: t`Range officer on the way`, color: css.yellowB };
      default:
        return { text: t`Range closed`, color: css.redB };
    }
  }, [t, rangeSupervision]);

  return <h2 className={classes(css.info, color)}>{text}</h2>;
}

function Legends() {
  const { t } = useLingui();
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 gap-2">
        <LegendItem label={t`Open`} colorClass={css.greenB} />
        <LegendItem label={t`Closed`} colorClass={css.redB} />
        <LegendItem
          label={t`No track officer available`}
          colorClass={css.whiteB}
        />
        <div className="flex gap-1 justify-start items-center pl-2.5">
          <img
            className="size-5"
            src={info}
            alt={t`Track has additional information`}
          />
          <p>{t`Track has additional information`}</p>
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <div className="flex gap-1 justify-start items-center pl-2.5">
      <p className={classNames('size-5 border', colorClass)} />
      <p>{label}</p>
    </div>
  );
}
