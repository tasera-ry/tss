import classNames from 'classnames';
import { useMemo } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import { useQuery } from 'react-query';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Trans, useLingui } from '@lingui/react/macro';

import api from '@/api/api';
import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import { JumpToCurrent } from '@/utils/Utils';
import { DeviceStatusList } from '../../DeviceStatusList/DeviceStatusList';

import css from './DayView.module.scss';

const classes = classNames.bind(css);

export function Dayview() {
  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string }>();

  const targetDate = useMemo(() => {
    return dateParam ?? moment().format('YYYY-MM-DD');
  }, [dateParam]);

  const { data, isLoading } = useQuery({
    queryKey: ['dayview', targetDate],
    queryFn: () => api.getSchedulingDate(targetDate),
  });

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.getAllDevices(),
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

  

  const tracksCount = data?.tracks?.length ?? 0;
  const equipmentCount = devicesQuery.data?.length ?? 0;

  return (
    <div>
      <InfoBox tabletMode={true} />
      <div className={classes(css.dayviewContainer)}>
        <div className={classes(css.viewChangerWrapper)}>
          <JumpToCurrent />
          <ViewChanger />
        </div>

        <DateHeader
          targetDate={targetDate}
          onPrevious={previousDayClick}
          onNext={nextDayClick}
        />

        <div className={classes(css.mainCard)}>
          <div className={classes(css.summaryText)}>
            <Trans>{tracksCount} rataa</Trans>
            {' • '}
            <Trans>{equipmentCount} välinettä</Trans>
          </div>

          {data && (
            <OfficerBanner
              rangeSupervision={data.rangeSupervision}
              opensAt={opensAt}
              closesAt={closesAt}
              arrivingAt={data.arriving_at}
            />
          )}

          <h3 className={classes(css.sectionTitle)}>
            <Trans>Radat</Trans>
          </h3>

          {isLoading || !data ? (
            <div className="flex justify-center p-6">
              <CircularProgress disableShrink />
            </div>
          ) : (
            <TrackList tracks={data.tracks} date={targetDate} />
          )}

          <h3 className={classes(css.sectionTitle)}>
            <Trans>Välineet</Trans>
          </h3>
          <div className={classes(css.devicesWrapper)}>
            <DeviceStatusList />
          </div>  
        </div>
      </div>
    </div>
  );
}

export default Dayview;

function TrackList({ tracks, date }: { tracks: any[]; date: string }) {
  return (
    <div className={classes(css.tracksGrid)}>
      {tracks.map((track) => (
        <TrackBox key={track.id} track={track} date={date} />
      ))}
    </div>
  );
}

function TrackBox({ track, date }: { track: any; date: string }) {
  const { t } = useLingui();

  const { statusClass, borderClass, statusText, icon } = useMemo(() => {
    switch (track.trackSupervision) {
      case 'present':
      case 'confirmed':
        return {
          statusClass: css.greenB,
          borderClass: css.greenBorder,
          statusText: t`Avoinna`,
          icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
        };
      case 'closed':
        return {
          statusClass: css.redB,
          borderClass: css.redBorder,
          statusText: t`Suljettu`,
          icon: <HighlightOffIcon className={css.statusIcon} />,
        };
      case 'absent':
      case 'not confirmed':
      default:
        return {
          statusClass: css.whiteB,
          statusText: t`Ei valvojaa`,
          icon: null,
        };
    }
  }, [track.trackSupervision, t]);

  const link = `/trackview/${date}/${track.name}`;

  return (
    <Link to={link} className={classes(css.trackCard, borderClass)}>
      <div className={classes(css.trackDetails)}>
        <div className={classes(css.trackHeader)}>
          <span className={classes(css.bold)}>{track.name}</span>
          {track.notice && track.notice.length > 0 && (
            <InfoIcon
              className={css.infoIcon}
              titleAccess={t`Track has additional information`}
            />
          )}
        </div>
        <div className={classes(css.trackDesc)}>
          {track.description || track.short_description}
        </div>
        {track.subType && (
          <div className={classes(css.trackSub)}>{track.subType}</div>
        )}
      </div>

      <div className={classes(css.statusBadge, statusClass)}>
        {icon}
        <span>{statusText}</span>
      </div>
    </Link>
  );
}

function OfficerBanner({
  rangeSupervision,
  opensAt,
  closesAt,
  arrivingAt,
}: {
  rangeSupervision: string;
  opensAt?: string;
  closesAt?: string;
  arrivingAt?: string | null;
}) {
  const { t } = useLingui();

  const { text, colorClass } = useMemo(() => {
    switch (rangeSupervision) {
      case 'present':
        return { text: t`Päävalvoja paikalla`, colorClass: css.lightGreenB };
      case 'confirmed':
        return { text: t`Päävalvoja varmistettu`, colorClass: css.lightGreenB };
      case 'not confirmed':
        return { text: t`Päävalvojaa ei varmistettu`, colorClass: css.blueB };
      case 'absent':
        return { text: t`Ei päävalvojaa`, colorClass: css.whiteB };
      default:
        return { text: t`Rata suljettu`, colorClass: css.redB };
    }
  }, [t, rangeSupervision]);

  return (
    <div className={classes(css.supervisorBanner, colorClass)}>
      <div className={classes(css.supervisorLeft)}>
        <AccessTimeIcon className={css.bannerClockIcon} />
        <div className={classes(css.supervisorText)}>
          <h3 className={classes(css.supervisorTitle)}>{text}</h3>
          {arrivingAt && (
            <span className={classes(css.arrivalTime)}>
              <Trans>Your estimated time of arrival:</Trans>{' '}
              {moment(arrivingAt, 'HH:mm:ss').format('H.mm')}
            </span>
          )}
        </div>
      </div>
      {opensAt && closesAt && (
        <div className={classes(css.supervisorRight)}>
          <span className={classes(css.openHoursLabel)}>
            <Trans>AUKIOLAIKA</Trans>
          </span>
          <span className={classes(css.openHoursTime)}>
            {opensAt}–{closesAt}
          </span>
        </div>
      )}
    </div>
  );
}