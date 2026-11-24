import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';
import moment from 'moment';
import { useQuery } from 'react-query';

import { JumpToCurrent } from '@/utils/Utils';
import api from '../api/api';
import css from './Trackview.module.scss';
import { formatTime, toTrackViewDay } from './trackViewPlaceholder';
import type {
  LaneSection,
  RangeOfficerState,
  SegmentStatus,
  TimeSegment,
  TrackDetail,
  TrackViewDay,
  UnavailableReason,
} from './trackViewTypes';
import { awaitingRangeOfficer, unavailableReason } from './trackViewTypes';
import { usePositionName, useTrackName } from './useTrackName';

/**
 * Track view (#432 redesign).
 *
 * Read-only by design: over a thousand members only ever look at this. Creating
 * and editing reservations is an association and admin task and belongs in the
 * scheduling view.
 *
 * Notes and the range officer exception still come from
 * `trackViewPlaceholder`; everything else is live data. The backend work left is
 * listed at the top of that file.
 */
export function Trackview() {
  const { t } = useLingui();
  const trackName = useTrackName();
  const { date: dateParam, track } = useParams<{
    date?: string;
    track: string;
  }>();
  // The date is optional in the route; default to today, as the other views do.
  const targetDate = dateParam ?? moment().format('YYYY-MM-DD');

  const scheduleQuery = useQuery({
    queryKey: ['trackview', targetDate],
    queryFn: () => api.getSchedulingDate(targetDate),
    // Keep the day on screen while the next one loads, so stepping through days
    // does not unmount the arrows and drop keyboard focus.
    keepPreviousData: true,
  });
  const sectionsQuery = useQuery({
    queryKey: ['trackSections'],
    queryFn: api.getTrackSections,
  });
  const reservationsQuery = useQuery({
    queryKey: ['trackReservations', targetDate],
    queryFn: () => api.getTrackReservations(targetDate),
    keepPreviousData: true,
  });

  const queries = [scheduleQuery, sectionsQuery, reservationsQuery];
  const status = queries.some((q) => q.status === 'error')
    ? 'error'
    : queries.some((q) => q.status === 'loading')
      ? 'loading'
      : 'success';

  const schedule = scheduleQuery.data;
  const sections = sectionsQuery.data;
  const reservations = reservationsQuery.data;
  const day = useMemo(
    () => toTrackViewDay(schedule, sections, reservations),
    [schedule, sections, reservations],
  );

  // The route carries the track NAME, not its id, so a renamed track breaks
  // existing deep links. Kept as-is to avoid changing the day view's links in
  // the same change; worth fixing separately.
  const selectedTrack = useMemo(
    () => day?.tracks.find((item) => item.name === track),
    [day, track],
  );

  if (status === 'error') {
    return (
      <TrackViewContainer date={targetDate} track={track}>
        <h1 className="font-bold text-2xl">{t`Error`}</h1>
        <p>{t`Something went wrong. Please try again later.`}</p>
      </TrackViewContainer>
    );
  }

  if (status === 'loading') {
    return (
      <TrackViewContainer date={targetDate} track={track}>
        <CircularProgress />
        <span>{t`Loading...`}</span>
      </TrackViewContainer>
    );
  }

  if (!day || !selectedTrack) {
    return (
      <TrackViewContainer date={targetDate} track={track}>
        <h1 className="font-bold text-2xl">{t`Track not found`}</h1>
        <p>{t`This track has no schedule for the selected day.`}</p>
      </TrackViewContainer>
    );
  }

  const blocked = unavailableReason(day, selectedTrack);

  return (
    <TrackViewContainer date={targetDate} track={track}>
      <DateNav date={targetDate} track={selectedTrack.name} />
      <p className="-mt-3 text-center text-grey text-sm">
        {day.open !== null && day.close !== null && (
          <>
            {t`Open`} {formatTime(day.open)}–{formatTime(day.close)}
          </>
        )}
        {day.open !== null &&
          day.close !== null &&
          day.sunset !== null &&
          ' · '}
        {day.sunset !== null && (
          <>
            {t`Sunset`} {formatTime(day.sunset)}
          </>
        )}
      </p>

      <RangeOfficerBanner day={day} />

      {/* The tracks as one row of buttons under the banner, then the track. */}
      <div className="flex flex-col gap-5">
        <TrackChips
          date={targetDate}
          tracks={day.tracks}
          selected={selectedTrack.name}
        />

        <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-black-tint-20 bg-white p-4 sm:p-5 lg:p-6">
          <h2 className="font-semibold text-xl">
            {trackName(selectedTrack.name)}
          </h2>
          <TrackHeader track={selectedTrack} />
          {day.open !== null && day.close !== null && (
            <Timeline
              track={selectedTrack}
              open={day.open}
              close={day.close}
              sunset={day.sunset}
              blocked={blocked}
            />
          )}
          <SegmentList
            track={selectedTrack}
            blocked={blocked}
            arrivingAt={day.rangeOfficerArrivingAt}
            awaiting={
              selectedTrack.requiresRangeOfficer && awaitingRangeOfficer(day)
                ? day.rangeOfficer
                : null
            }
          />
        </section>
      </div>
    </TrackViewContainer>
  );
}

function TrackViewContainer({
  date,
  track,
  children,
}: { date: string; track?: string; children: React.ReactNode }) {
  return (
    // One readable column, at most 1024px, centred, as in the day view and the
    // old month and week views. Wider rows are harder to read and scan (WCAG
    // 1.4.8; GOV.UK and USWDS cap their pages at 960-1024px).
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-4 pb-16 sm:px-6">
      {/* Back to the day view on the left (the track view is one level
          deeper), Today in the middle, the view tabs on the right. On phones
          the back link has its own row and Today goes left. */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="col-span-2 sm:col-span-1 sm:col-start-1 sm:justify-self-start">
          <BackLink date={date} />
        </div>
        <div className="sm:col-start-2">
          <JumpToCurrent view="trackview" rest={track} />
        </div>
        <div className="justify-self-end sm:col-start-3">
          <ViewTabs date={date} />
        </div>
      </div>
      {children}
    </div>
  );
}

function BackLink({ date }: { date: string }) {
  const { t } = useLingui();
  return (
    <Link
      className="-ml-2 flex items-center gap-1 p-2 text-grey hover:text-black"
      to={`/dayview/${moment(date).format('YYYY-MM-DD')}`}
    >
      <ArrowBackIcon fontSize="small" />
      {t`Back to day view`}
    </Link>
  );
}

/*
 * Navigation. Until this redesign the track view had none: seeing another day,
 * another track or another view meant going back to the day view first (M-61).
 * Everything here is a link rather than a button, so it can be opened in a new
 * tab and the browser's back button works as members expect.
 */

/** Month / Week / Day / Track, all for the date being shown. */
function ViewTabs({ date }: { date: string }) {
  const { t } = useLingui();
  const tab =
    'rounded-md border border-black-tint-20 bg-white px-3 py-1.5 text-grey text-sm hover:border-black-tint-40 hover:text-black';

  return (
    <nav aria-label={t`Views`} className="flex gap-1">
      <Link className={tab} to={`/monthview/${date}`}>{t`Month`}</Link>
      <Link className={tab} to={`/weekview/${date}`}>{t`Week`}</Link>
      <Link className={tab} to={`/dayview/${date}`}>{t`Day`}</Link>
      <span
        aria-current="page"
        className="rounded-md border border-black-tint-70 bg-black-tint-70 px-3 py-1.5 font-medium text-sm text-white"
      >
        {t`Track`}
      </span>
    </nav>
  );
}

/** The date, with the previous and next day on the same track either side. */
function DateNav({ date, track }: { date: string; track: string }) {
  const { t, i18n } = useLingui();

  // Same wording as the other views' DateHeader, e.g. "Keskiviikkona 7.10.2026".
  const label = useMemo(() => {
    const text = i18n.date(new Date(date), {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, [date, i18n]);

  const shift = (days: number) =>
    `/trackview/${moment(date).add(days, 'day').format('YYYY-MM-DD')}/${track}`;
  const arrow =
    'flex size-9 shrink-0 items-center justify-center rounded-lg border border-black-tint-20 bg-white text-grey hover:border-black-tint-40 hover:text-black';

  return (
    <div className="flex items-center justify-center gap-3">
      <Link className={arrow} to={shift(-1)} aria-label={t`Previous day`}>
        <ChevronLeftIcon fontSize="small" />
      </Link>
      <h1 className="text-center font-semibold text-xl">{label}</h1>
      <Link className={arrow} to={shift(1)} aria-label={t`Next day`}>
        <ChevronRightIcon fontSize="small" />
      </Link>
    </div>
  );
}

/**
 * Every track on this day. The chips wrap onto a second line rather than
 * scrolling sideways: tracks hidden past the edge of a phone screen with nothing
 * to say they exist was the worst finding in the evaluation (M-04). On desktop
 * they stack into a sidebar that stays in view while the track scrolls.
 */
function TrackChips({
  date,
  tracks,
  selected,
}: { date: string; tracks: TrackDetail[]; selected: string }) {
  const { t } = useLingui();
  const trackName = useTrackName();

  return (
    <nav aria-label={t`Tracks`} className="flex flex-wrap gap-2">
      {tracks.map((item) =>
        item.name === selected ? (
          <span
            key={item.id}
            aria-current="page"
            className="rounded-full border border-black bg-black-tint-05 px-3 py-1.5 font-medium text-sm"
          >
            {trackName(item.name)}
          </span>
        ) : (
          <Link
            key={item.id}
            className="rounded-full border border-black-tint-20 bg-white px-3 py-1.5 text-grey text-sm hover:border-black-tint-40 hover:text-black"
            to={`/trackview/${date}/${item.name}`}
          >
            {trackName(item.name)}
          </Link>
        ),
      )}
    </nav>
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
  // Booked but not on site yet: how every future day looks.
  const awaiting = awaitingRangeOfficer(day);

  const closed = day.rangeOfficer === 'closed';

  let title = t`No range officer present`;
  if (closed) title = t`Range closed`;
  else if (present) title = t`Range officer present`;
  else if (day.rangeOfficer === 'confirmed') title = t`Range officer confirmed`;
  else if (day.rangeOfficer === 'not confirmed') {
    title = t`Range officer predefined`;
  }

  return (
    <div
      className={classNames(
        'flex items-start gap-3 rounded-md border p-3',
        present || awaiting
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
        <b className="font-semibold">{title}</b>
        <span className="block text-grey">
          {present && t`Tracks can be used during opening hours.`}
          {awaiting && t`Tracks can be used once the range officer arrives.`}
          {closed && t`No track can be used on this day.`}
          {!present &&
            !awaiting &&
            !closed &&
            t`No track can be used until the range officer arrives.`}
          {day.rangeOfficerArrivingAt !== null && (
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
        <p className="whitespace-pre-wrap text-sm">{track.description}</p>
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

/** "Lohko 2" in the interface language; nothing for an undivided track. */
function SectionLabel({ number }: { number: number | null }) {
  const { t } = useLingui();
  if (number === null) return null;
  return <>{t`Section ${number}`}</>;
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
  sunset,
  blocked,
}: {
  track: TrackDetail;
  open: number;
  close: number;
  sunset: number | null;
  blocked: UnavailableReason;
}) {
  const { t } = useLingui();
  const label = useSegmentLabel();
  const span = close - open;
  const named = track.sections.some((s) => s.number !== null);
  const pct = (minutes: number) => ((minutes - open) / span) * 100;
  // On tracks with no shooting after dark, the open hours after sunset are
  // shaded and say so. The exact time is in the line under the date.
  const dark =
    track.daylightOnly && sunset !== null && sunset < close
      ? Math.max(sunset, open)
      : null;

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
              <SectionLabel number={section.number} />
            </span>
          )}
          <div className="relative h-11 min-w-0 flex-1 overflow-hidden rounded-sm bg-status-free">
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
                    'absolute top-0 bottom-0 flex items-center justify-center overflow-hidden rounded-xs border border-black-tint-30 text-sm',
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
            {dark !== null && (
              <div
                className={classNames(
                  'absolute top-0 right-0 bottom-0 flex items-center justify-center overflow-hidden text-sm',
                  css.afterSunset,
                )}
                style={{ left: `${pct(dark)}%` }}
              >
                <em className="truncate px-1.5 font-medium not-italic">
                  {t`After sunset`}
                </em>
              </div>
            )}
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
  awaiting,
}: {
  track: TrackDetail;
  blocked: UnavailableReason;
  arrivingAt: number | null;
  /** Set when a range officer is booked for this track's day but not on site. */
  awaiting: RangeOfficerState | null;
}) {
  const { t } = useLingui();
  const positionName = usePositionName();
  const label = useSegmentLabel();
  // Nothing to list until the track's sections exist (none are seeded in production).
  if (track.sections.length === 0) return null;
  const grouped = track.sections.some((s) => s.number !== null);

  const arrival =
    arrivingAt !== null
      ? t`Range officer arriving at ${formatTime(arrivingAt)}`
      : null;

  // The cause, and where it is known, when it changes. "Should I come later?"
  // is the question a member actually has.
  const reasonText = (reason: UnavailableReason) => {
    if (reason === 'noTrackOfficer') return t`No track officer present`;
    return arrival ?? t`No range officer present`;
  };

  // Free time on a day whose range officer is still to arrive: open, but say so.
  let awaitingText: string | null = null;
  if (awaiting === 'confirmed')
    awaitingText = arrival ?? t`Range officer confirmed`;
  else if (awaiting === 'not confirmed')
    awaitingText = t`Range officer predefined`;

  // Rows follow the width of their own list (container queries), not the
  // screen's: time on its own line when narrow, which is both a phone and a
  // lohko column on a wide desktop.
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
        detail = [label(state), segment.reservedFor, bookedText, awaitingText]
          .filter(Boolean)
          .join(' · ');
      } else if (state === 'free' && awaitingText) detail = awaitingText;

      return (
        <li
          key={`${segment.start}-${segment.end}`}
          className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 border-black-tint-10 border-b py-3 last:border-b-0 @sm:grid-cols-[auto_1fr_auto]"
        >
          <span className="col-span-full text-grey text-sm tabular-nums @sm:col-span-1 @sm:text-black">
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
      <ul className="@container list-none border-black-tint-10 border-t p-0">
        {rows(track.sections[0])}
      </ul>
    );
  }

  return (
    // Side by side on wide screens: track 1's lohkot read left, middle, right,
    // the way they sit on the range.
    <div className="grid gap-2.5 xl:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] xl:items-start">
      {track.sections.map((section) => (
        <div
          key={section.id}
          className="overflow-hidden rounded-md border border-black-tint-20"
        >
          {/* h3: a section belongs to the track, whose name is the h2. */}
          <h3 className="flex justify-between gap-2 border-black-tint-20 border-b bg-black-tint-05 px-3 py-2 font-semibold text-grey text-xs uppercase tracking-wider">
            <span>
              <SectionLabel number={section.number} />
              {section.position && (
                <>
                  {' '}
                  {/* Own line on phones, beside the name from sm up. */}
                  <span className="block font-normal normal-case tracking-normal sm:ml-1 sm:inline">
                    {positionName(section.position)}
                  </span>
                </>
              )}
            </span>
            <span className="shrink-0 whitespace-nowrap font-normal normal-case tabular-nums">
              {section.laneCount} {t`lanes`}
            </span>
          </h3>
          <ul className="@container list-none px-3 py-0">{rows(section)}</ul>
        </div>
      ))}
    </div>
  );
}
