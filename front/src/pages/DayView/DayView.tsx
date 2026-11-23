import {
  formatTime,
  toMinutes,
  toTrackViewDay,
} from '@/trackview/trackViewPlaceholder';
import {
  type TrackDetail,
  type TrackViewDay,
  awaitingRangeOfficer,
  unavailableReason,
} from '@/trackview/trackViewTypes';
import { useTrackName } from '@/trackview/useTrackName';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import moment from 'moment';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';

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

  // The same mapping and rules as the track view, so the two cannot disagree.
  const day = useMemo(() => toTrackViewDay(data), [data]);

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

  // hh.mm, as everywhere else. Read from the payload: toTrackViewDay fills
  // missing hours with 10-19, which the banner must not show.
  const opensAt = useMemo(() => {
    const minutes = toMinutes(data?.open);
    return minutes === null ? undefined : formatTime(minutes);
  }, [data]);

  const closesAt = useMemo(() => {
    const minutes = toMinutes(data?.close);
    return minutes === null ? undefined : formatTime(minutes);
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
            <Plural value={tracksCount} one="# track" other="# tracks" />
            {' • '}
            <Plural value={equipmentCount} one="# device" other="# devices" />
          </div>

          {data && (
            <OfficerBanner
              rangeSupervision={data.rangeSupervision}
              opensAt={opensAt}
              closesAt={closesAt}
              arrivingAt={day?.rangeOfficerArrivingAt ?? null}
            />
          )}

          <h3 className={classes(css.sectionTitle)}>
            <Trans>Tracks</Trans>
          </h3>

          {isLoading || !data || !day ? (
            <div className="flex justify-center p-6">
              <CircularProgress disableShrink />
            </div>
          ) : (
            <TrackList tracks={data.tracks} day={day} date={targetDate} />
          )}

          <h3 className={classes(css.sectionTitle)}>
            <Trans>Devices</Trans>
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

function TrackList({
  tracks,
  day,
  date,
}: {
  tracks: any[];
  day: TrackViewDay;
  date: string;
}) {
  return (
    <div className={classes(css.tracksGrid)}>
      {tracks.map((track, i) => (
        <TrackBox
          key={track.id}
          track={track}
          status={cardStatus(day, day.tracks[i])}
          date={date}
        />
      ))}
    </div>
  );
}

type CardStatus =
  | { kind: 'open' | 'closed' | 'private' | 'awaiting' }
  | { kind: 'noRangeOfficer' | 'noTrackOfficer' }
  | { kind: 'opensAt'; at: number };

/**
 * What a track's card says. Never "Open" before the range officer is on site
 * (customer, 8.10.2026): with an arrival time the card says when the track
 * opens, the later of the arrival and the opening time; without one it waits.
 * Closed and private event show as they are. Track 6 needs no range officer
 * (12.10.2026), so for it only its own officer counts.
 */
export function cardStatus(day: TrackViewDay, track: TrackDetail): CardStatus {
  if (day.rangeOfficer === 'closed' || track.officer === 'closed') {
    return { kind: 'closed' };
  }
  if (track.officer === 'private') return { kind: 'private' };
  if (track.requiresRangeOfficer && awaitingRangeOfficer(day)) {
    const arrival =
      day.rangeOfficer === 'confirmed' ? day.rangeOfficerArrivingAt : null;
    // An arrival at or after closing opens nothing that day.
    if (arrival === null || (day.close !== null && arrival >= day.close)) {
      return { kind: 'awaiting' };
    }
    return { kind: 'opensAt', at: Math.max(arrival, day.open ?? arrival) };
  }
  const reason = unavailableReason(day, track);
  if (reason) return { kind: reason };
  return { kind: 'open' };
}

function TrackBox({
  track,
  status,
  date,
}: {
  track: any;
  status: CardStatus;
  date: string;
}) {
  const { t } = useLingui();
  const trackName = useTrackName();

  const { statusClass, borderClass, statusText, icon } = useMemo(() => {
    switch (status.kind) {
      case 'open':
        return {
          statusClass: css.greenB,
          borderClass: css.greenBorder,
          statusText: t`Open`,
          icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
        };
      case 'closed':
        return {
          statusClass: css.redB,
          borderClass: css.redBorder,
          statusText: t`Closed`,
          icon: <HighlightOffIcon className={css.statusIcon} />,
        };
      case 'private':
        return {
          statusClass: css.orangeB,
          borderClass: undefined,
          statusText: t`Private event`,
          icon: null,
        };
      case 'opensAt': {
        const time = formatTime(status.at);
        return {
          statusClass: css.whiteB,
          borderClass: undefined,
          statusText: t`Opens at ${time}`,
          icon: <AccessTimeIcon className={css.statusIcon} />,
        };
      }
      case 'awaiting':
        return {
          statusClass: css.whiteB,
          borderClass: undefined,
          statusText: t`Awaiting range officer`,
          icon: <AccessTimeIcon className={css.statusIcon} />,
        };
      case 'noRangeOfficer':
        return {
          statusClass: css.whiteB,
          borderClass: undefined,
          statusText: t`No range officer present`,
          icon: null,
        };
      default:
        return {
          statusClass: css.whiteB,
          borderClass: undefined,
          statusText: t`No track officer present`,
          icon: null,
        };
    }
  }, [status, t]);

  const link = `/trackview/${date}/${track.name}`;

  return (
    <Link to={link} className={classes(css.trackCard, borderClass)}>
      <div className={classes(css.trackDetails)}>
        <div className={classes(css.trackHeader)}>
          <span className={classes(css.bold)}>{trackName(track.name)}</span>
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
  /** Minutes from midnight, when the range officer has given one. */
  arrivingAt: number | null;
}) {
  const { t } = useLingui();

  const { text, colorClass } = useMemo(() => {
    switch (rangeSupervision) {
      case 'present':
        return { text: t`Range officer present`, colorClass: css.lightGreenB };
      case 'confirmed':
        // Booked but not on site yet: green is kept for present.
        return { text: t`Range officer confirmed`, colorClass: css.whiteB };
      case 'not confirmed':
        return { text: t`Range officer predefined`, colorClass: css.blueB };
      case 'absent':
        return { text: t`No range officer present`, colorClass: css.whiteB };
      default:
        return { text: t`Range closed`, colorClass: css.redB };
    }
  }, [t, rangeSupervision]);

  return (
    <div className={classes(css.supervisorBanner, colorClass)}>
      <div className={classes(css.supervisorLeft)}>
        <AccessTimeIcon className={css.bannerClockIcon} />
        <div className={classes(css.supervisorText)}>
          <h3 className={classes(css.supervisorTitle)}>{text}</h3>
          {arrivingAt !== null && (
            <span className={classes(css.arrivalTime)}>
              {t`Range officer arriving at ${formatTime(arrivingAt)}`}
            </span>
          )}
        </div>
      </div>
      {opensAt && closesAt && (
        <div className={classes(css.supervisorRight)}>
          <span className={classes(css.openHoursLabel)}>
            <Trans>OPENING HOURS</Trans>
          </span>
          <span className={classes(css.openHoursTime)}>
            {opensAt}–{closesAt}
          </span>
        </div>
      )}
    </div>
  );
}
