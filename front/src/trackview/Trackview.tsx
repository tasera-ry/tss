import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';
import moment from 'moment';
import { useQuery } from 'react-query';

import api from '../api/api';
import { useWeekDay } from '../utils/dateUtils';
import css from './Trackview.module.scss';
import { formatTime, toTrackViewDay } from './trackViewPlaceholder';
import type {
  LaneSection,
  SegmentStatus,
  TimeSegment,
  TrackDetail,
  TrackViewDay,
  UnavailableReason,
} from './trackViewTypes';
import { unavailableReason } from './trackViewTypes';

/**
 * Track view (#432 redesign, with placeholders for #419, #420 and #421).
 *
 * Read-only by design: over a thousand members only ever look at this. Creating
 * and editing reservations is an association and admin task and belongs in the
 * scheduling view.
 *
 * Time segments, lane counts and sections come from `trackViewPlaceholder` until
 * the backend provides them; everything else is live data. The backend work
 * needed is listed at the top of that file as B1–B10.
 */
export function Trackview() {
  const { t } = useLingui();
  const { date: targetDate, track } = useParams<{
    date: string;
    track: string;
  }>();

  const { data: schedule, status } = useQuery({
    queryKey: ['trackview', targetDate],
    queryFn: () => api.getSchedulingDate(targetDate),
    enabled: !!targetDate,
  });

  const day = useMemo(() => toTrackViewDay(schedule), [schedule]);

  // The route carries the track NAME, not its id, so a renamed track breaks
  // existing deep links. Kept as-is to avoid changing the day view's links in
  // the same change; worth fixing separately.
  const selectedTrack = useMemo(
    () => day?.tracks.find((item) => item.name === track),
    [day, track],
  );

  const date = useMemo(() => new Date(targetDate), [targetDate]);
  const weekDay = useWeekDay(date, 'short');

  if (status === 'error') {
    return (
      <TrackViewContainer date={targetDate}>
        <h1 className="font-bold text-2xl">{t`Error`}</h1>
        <p>{t`Something went wrong. Please try again later.`}</p>
      </TrackViewContainer>
    );
  }

  if (status === 'loading') {
    return (
      <TrackViewContainer date={targetDate}>
        <CircularProgress />
        <span>{t`Loading...`}</span>
      </TrackViewContainer>
    );
  }

  if (!day || !selectedTrack) {
    return (
      <TrackViewContainer date={targetDate}>
        <h1 className="font-bold text-2xl">{t`Track not found`}</h1>
        <p>{t`This track has no schedule for the selected day.`}</p>
      </TrackViewContainer>
    );
  }

  const blocked = unavailableReason(day, selectedTrack);

  return (
    <TrackViewContainer date={targetDate}>
      <h1 className="font-bold text-2xl text-center text-balance">
        {selectedTrack.name}
      </h1>
      <p className="text-grey text-sm">
        {weekDay} {moment(date).format('DD.MM.YYYY')}
        {day.open !== null && day.close !== null && (
          <>
            {' · '}
            {t`Open`} {formatTime(day.open)}–{formatTime(day.close)}
          </>
        )}
        {day.sunset !== null && (
          <>
            {' · '}
            {t`Sunset`} <DevValue>{formatTime(day.sunset)}</DevValue>
          </>
        )}
      </p>

      <RangeOfficerBanner day={day} />

      <div className="w-full max-w-3xl flex flex-col gap-4 px-4">
        <TrackHeader track={selectedTrack} />
        <p className="-mb-2">
          <DevFlag kind="placeholder" />
        </p>
        {day.open !== null && day.close !== null && (
          <Timeline
            track={selectedTrack}
            open={day.open}
            close={day.close}
            blocked={blocked}
          />
        )}
        <SegmentList
          track={selectedTrack}
          blocked={blocked}
          arrivingAt={day.rangeOfficerArrivingAt}
        />
      </div>
    </TrackViewContainer>
  );
}

function TrackViewContainer({
  date,
  children,
}: { date: string; children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center gap-2 pt-12 pb-16">
      <BackLink date={date} />
      {children}
    </div>
  );
}

function BackLink({ date }: { date: string }) {
  const { t } = useLingui();
  return (
    <Link
      className="absolute top-2 left-2 flex items-center gap-1 p-2 text-grey hover:text-black"
      to={`/dayview/${moment(date).format('YYYY-MM-DD')}`}
    >
      <ArrowBackIcon fontSize="small" />
      {t`Back to day view`}
    </Link>
  );
}

/**
 * The range officer gates everything below it. The customer confirmed on
 * 8.10.2026 that no track can be open while the range officer is away, so this
 * is a precondition rather than one metadata item among several.
 */
function RangeOfficerBanner({ day }: { day: TrackViewDay }) {
  const { t } = useLingui();
  const present = day.rangeOfficer === 'present';

  return (
    <div
      className={classNames(
        'w-full max-w-3xl mx-4 flex items-start gap-3 rounded-md border p-3',
        present
          ? 'border-black-tint-20 bg-white'
          : 'border-black-tint-40 bg-black-tint-05',
      )}
      data-testid="range-officer-banner"
    >
      <span
        className={classNames(
          'mt-1.5 size-2.5 shrink-0 rounded-full',
          present ? css.dotPresent : 'border-2 border-grey',
        )}
      />
      <span className="text-sm">
        <b className="font-semibold">
          {present ? t`Range officer present` : t`No range officer present`}
        </b>
        <span className="block text-grey">
          {present
            ? t`Tracks can be used during opening hours.`
            : t`No track can be used until the range officer arrives.`}
          {!present && day.rangeOfficerArrivingAt !== null && (
            <>
              {' '}
              {t`Estimated arrival`} {formatTime(day.rangeOfficerArrivingAt)}.
            </>
          )}
        </span>
      </span>
    </div>
  );
}

function TrackHeader({ track }: { track: TrackDetail }) {
  const { t } = useLingui();
  const lanes = track.sections.reduce((sum, s) => sum + s.laneCount, 0);
  const officerPresent = track.officer === 'present';

  return (
    <div className="flex flex-col gap-2">
      {track.description && (
        <p className="whitespace-pre-wrap text-sm">
          {track.description}
          <DevFlag kind="description" />
        </p>
      )}
      <p className="text-grey text-sm tabular-nums">
        {lanes} {t`lanes`}
        {track.sections.length > 1 && (
          <>
            {' '}
            · {track.sections.length} {t`sections`}
          </>
        )}
      </p>

      <p className="flex flex-wrap items-baseline gap-2 text-sm">
        <span
          className={classNames(
            'relative top-0.5 size-2 shrink-0 rounded-full',
            officerPresent ? css.dotPresent : 'border-2 border-grey',
          )}
        />
        <b className="font-semibold">
          {officerPresent
            ? t`Track officer present`
            : t`No track officer present`}
        </b>
        {!officerPresent && (
          <span className="text-grey">{t`Members may not enter a track without a track officer.`}</span>
        )}
      </p>

      {track.notice && (
        <p className="border-grey border-l-3 bg-black-tint-05 py-2 pr-3 pl-3 text-sm">
          <b className="font-semibold">{t`Notice for the day`}</b>{' '}
          {track.notice}
          <DevFlag kind="notice" />
        </p>
      )}
      {track.notes.map((note) => (
        <p key={note} className="text-grey text-sm">
          {note}
        </p>
      ))}
    </div>
  );
}

/**
 * Development-only marker, stripped from production builds.
 *
 * Three things on this page look like defects in the dev environment and are
 * not. Each gets its own wording so nobody has to work out which is which.
 *
 * `description` — track.description. The track's permanent physical
 *   description, maintained by an admin in the Radat view. Real content reads
 *   like "75m / 100m Hirvirata - 20 ampumapaikkaa". The dev seed generates a
 *   short label instead ("Pistol 300m"), from 04_tracks.js:38.
 *
 * `notice` — track_supervision.notice. The free-text note a range officer
 *   writes for one track on one day; it is what the "Radalla lisätietoja" icon
 *   announces. Real content reads like "Taustavalli huollossa". The dev seed
 *   fills it with faker Latin, from 08_track_supervision.js:52, which is where
 *   the lorem ipsum on this page comes from.
 *
 * Both are database text, and there is no translation path for database text at
 * all — it stays as entered whatever language the interface is set to.
 *
 * `placeholder` — time segments and lane counts, invented in
 *   trackViewPlaceholder.ts because the API does not carry them. See #420, #421.
 */
/**
 * A single invented value shown inline, marked in place rather than with a
 * sentence after it. Used for the sunset time, which has nowhere else to sit.
 * In production the value renders plainly.
 */
function DevValue({ children }: { children: React.ReactNode }) {
  if (!import.meta.env.DEV) return <>{children}</>;
  return (
    <span className={css.devValue} title="Placeholder — awaiting #437">
      {children}
    </span>
  );
}

function DevFlag({ kind }: { kind: 'description' | 'notice' | 'placeholder' }) {
  if (!import.meta.env.DEV) return null;

  const text = {
    description:
      'awaiting the real track description, maintained in Radat. Database text, never translated.',
    notice:
      'a range officer notice for this track on this day. Dev seed text (08_track_supervision.js). Database text, never translated.',
    placeholder:
      'placeholder data, the backend does not provide this yet (#420, #421).',
  }[kind];

  return <span className={css.devFlag}> — {text}</span>;
}

const SEGMENT_FILL: Record<SegmentStatus | 'blocked', string> = {
  free: '',
  private: css.segPrivate,
  official: css.segOfficial,
  closed: css.segClosed,
  blocked: css.segBlocked,
};

const SEGMENT_MARK: Record<SegmentStatus | 'blocked', string> = {
  free: css.markFree,
  private: css.markPrivate,
  official: css.markOfficial,
  closed: css.markClosed,
  blocked: css.markBlocked,
};

function useSegmentLabel() {
  const { t } = useLingui();
  return (status: SegmentStatus | 'blocked') => {
    switch (status) {
      case 'free':
        return t`Free`;
      case 'private':
        return t`Private event`;
      case 'official':
        return t`Reserved for authority use`;
      case 'closed':
        return t`Closed`;
      default:
        return t`No shooting`;
    }
  };
}

/** A segment that is free becomes unavailable when a supervisor is missing. */
function effectiveStatus(
  segment: TimeSegment,
  blocked: UnavailableReason,
): SegmentStatus | 'blocked' {
  return blocked && segment.status === 'free' ? 'blocked' : segment.status;
}

/**
 * The bar shows shape, the list below is authoritative. Fifteen minutes is about
 * 2.5% of a nine-hour day, so a proportional bar cannot distinguish 11.00–12.45
 * from 11.00–13.00. The axis ticks on whole hours and the exact times are written
 * out, so nobody has to measure.
 */
function Timeline({
  track,
  open,
  close,
  blocked,
}: {
  track: TrackDetail;
  open: number;
  close: number;
  blocked: UnavailableReason;
}) {
  const { t } = useLingui();
  const label = useSegmentLabel();
  const span = close - open;
  const named = track.sections.some((s) => s.name);
  const pct = (minutes: number) => ((minutes - open) / span) * 100;

  const hours: number[] = [];
  for (let m = Math.ceil(open / 60) * 60; m <= close; m += 60) hours.push(m);

  return (
    // Hidden on phones: the list carries everything, so there is no sideways
    // scrolling at any width.
    <div className="hidden sm:block" data-testid="timeline">
      <div
        className="relative h-5 border-black-tint-20 border-b"
        style={{ marginLeft: named ? '7.5rem' : 0 }}
      >
        {hours.map((m) => (
          <span
            key={m}
            className="absolute top-0 -translate-x-1/2 text-black-tint-50 text-xs tabular-nums"
            style={{ left: `${pct(m)}%` }}
          >
            {formatTime(m)}
          </span>
        ))}
      </div>

      {track.sections.map((section) => (
        <div key={section.id} className="mt-2 flex items-stretch">
          {named && (
            <span className="flex w-30 shrink-0 items-center pr-3 text-grey text-xs">
              {section.name}
            </span>
          )}
          <div className="relative h-10 min-w-0 flex-1 overflow-hidden rounded-sm bg-black-tint-05">
            {hours.slice(0, -1).map((m) => (
              <i
                key={m}
                className="absolute top-0 bottom-0 w-px bg-black-tint-10"
                style={{ left: `${pct(m)}%` }}
              />
            ))}
            {section.segments.map((segment) => {
              const state = effectiveStatus(segment, blocked);
              if (state === 'free') return null;
              // The lanes a booking leaves free are only on offer while the
              // track is usable (see unavailableReason). Otherwise the booking
              // is drawn whole, like any other, and the list says '—'.
              const partlyFree =
                !blocked &&
                state !== 'closed' &&
                segment.lanesUsed !== undefined &&
                segment.lanesUsed < section.laneCount;
              return (
                <div
                  key={`${segment.start}-${segment.end}`}
                  className={classNames(
                    'absolute top-0 bottom-0 flex items-center justify-center overflow-hidden rounded-xs border border-black-tint-30 text-xs',
                    partlyFree ? '' : SEGMENT_FILL[state],
                  )}
                  style={{
                    left: `${pct(segment.start)}%`,
                    width: `${pct(segment.end) - pct(segment.start)}%`,
                  }}
                >
                  {partlyFree && (
                    // The reserved share is drawn from the top; what is left
                    // below it is still open track.
                    <i
                      className={classNames(
                        'absolute inset-x-0 top-0 border-black-tint-30 border-b',
                        SEGMENT_FILL[state],
                      )}
                      style={{
                        height: `${((segment.lanesUsed ?? 0) / section.laneCount) * 100}%`,
                      }}
                    />
                  )}
                  <em className="relative flex min-w-0 px-1.5 font-medium not-italic">
                    <span className="truncate">
                      {partlyFree ? t`Partially available` : label(state)}
                    </span>
                    {partlyFree && (
                      // Free lanes out of all, the same figure as the list.
                      // Kept out of the truncation so a short bar loses the
                      // words first, never the number.
                      <span className="shrink-0 tabular-nums">
                        &nbsp;
                        {section.laneCount - (segment.lanesUsed ?? 0)}/
                        {section.laneCount}
                      </span>
                    )}
                  </em>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The authoritative record: exact times, written out, never behind a hover. */
function SegmentList({
  track,
  blocked,
  arrivingAt,
}: {
  track: TrackDetail;
  blocked: UnavailableReason;
  arrivingAt: number | null;
}) {
  const { t } = useLingui();
  const label = useSegmentLabel();
  const grouped = track.sections.some((s) => s.name);

  // The cause, and where it is known, when it changes. "Should I come later?"
  // is the question a member actually has.
  const reasonText = (reason: UnavailableReason) => {
    if (reason === 'noTrackOfficer') return t`No track officer present`;
    if (arrivingAt !== null) {
      return t`Range officer arriving at ${formatTime(arrivingAt)}`;
    }
    return t`No range officer present`;
  };

  const rows = (section: LaneSection) =>
    section.segments.map((segment) => {
      const state = effectiveStatus(segment, blocked);
      // While the track is unusable (see unavailableReason) nothing on it can
      // be used, including the lanes a booking leaves free.
      const usable = !blocked && state !== 'closed';
      const free =
        state === 'free'
          ? section.laneCount
          : section.laneCount - (segment.lanesUsed ?? section.laneCount);
      // A booking that leaves lanes free reads as open to others, with the
      // booking itself in the detail line. TASERA, review 10/2026: clubs often
      // book 10-20 lanes and everyone else is welcome on the rest.
      const partlyFree = usable && state !== 'free' && free > 0;
      const booked = segment.lanesUsed ?? 0;
      let detail: string | undefined = segment.reservedFor;
      if (state === 'blocked') detail = reasonText(blocked);
      else if (partlyFree) {
        const bookedText = t({
          message: plural(booked, {
            one: '# lane booked',
            other: '# lanes booked',
          }),
        });
        detail = [label(state), segment.reservedFor, bookedText]
          .filter(Boolean)
          .join(' · ');
      }

      return (
        <li
          key={`${segment.start}-${segment.end}`}
          className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 border-black-tint-10 border-b py-3 last:border-b-0 sm:grid-cols-[auto_1fr_auto]"
        >
          <span className="col-span-full text-grey text-sm tabular-nums sm:col-span-1 sm:text-black">
            {formatTime(segment.start)}–{formatTime(segment.end)}
          </span>
          <span className="min-w-0">
            <b className="font-medium">
              <i
                className={classNames(
                  'relative top-0.5 mr-2 inline-block size-3 overflow-hidden rounded-xs border border-black-tint-30',
                  partlyFree ? css.markFree : SEGMENT_MARK[state],
                )}
              >
                {partlyFree && (
                  // Top half in the booking's pattern, the rest free, as on the bar.
                  <i
                    className={classNames(
                      'absolute inset-x-0 top-0 h-1/2',
                      SEGMENT_MARK[state],
                    )}
                  />
                )}
              </i>
              {partlyFree ? t`Partially available` : label(state)}
            </b>
            {detail && (
              <small className="block text-grey text-xs">{detail}</small>
            )}
          </span>
          <span className="text-grey text-xs tabular-nums">
            {usable ? `${free}/${section.laneCount} ${t`free`}` : '—'}
          </span>
        </li>
      );
    });

  if (!grouped) {
    return (
      <ul className="list-none border-black-tint-10 border-t p-0">
        {rows(track.sections[0])}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {track.sections.map((section) => (
        <div
          key={section.id}
          className="overflow-hidden rounded-md border border-black-tint-20"
        >
          <h2 className="flex justify-between gap-2 border-black-tint-20 border-b bg-black-tint-05 px-3 py-2 font-semibold text-grey text-xs uppercase tracking-wider">
            <span>
              {section.name}
              {section.position && (
                <>
                  {' '}
                  {/* Own line on phones, beside the name from sm up. */}
                  <span className="block font-normal normal-case tracking-normal sm:ml-1 sm:inline">
                    {section.position}
                  </span>
                </>
              )}
            </span>
            <span className="shrink-0 whitespace-nowrap font-normal normal-case tabular-nums">
              {section.laneCount} {t`lanes`}
            </span>
          </h2>
          <ul className="list-none px-3 py-0">{rows(section)}</ul>
        </div>
      ))}
    </div>
  );
}
