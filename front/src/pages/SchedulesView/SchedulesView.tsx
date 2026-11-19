import { useLingui } from '@lingui/react/macro';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';

import api from '@/api/api';
import {
  type ApiReservation,
  type ApiSection,
  formatTime,
  toMinutes,
} from '@/trackview/trackViewPlaceholder';
import { useTrackName } from '@/trackview/useTrackName';
import { validateLogin } from '@/utils/Utils';
import { MonthCalendar } from './MonthCalendar';

/**
 * Schedules (#463): the admin page for one day of the range. A first part:
 * date navigation, the month calendar, and the day shown read-only. Editing
 * comes card by card; past days stay read-only (Pasi Autio, 13.11.2026).
 */
export function SchedulesView() {
  const { t, i18n } = useLingui();
  const history = useHistory();
  const { date: dateParam } = useParams<{ date?: string }>();
  const today = moment().format('YYYY-MM-DD');
  const date = dateParam ?? today;
  const past = date < today;

  useEffect(() => {
    validateLogin().then((loggedIn) => {
      if (!loggedIn) history.push('/');
    });
  }, [history]);

  const day = useQuery(['schedulesDay', date], () =>
    api.getSchedulingDate(date),
  );
  const sections = useQuery<ApiSection[]>(['trackSections'], () =>
    api.getTrackSections(),
  );
  const reservations = useQuery<ApiReservation[]>(
    ['trackReservations', date],
    () => api.getTrackReservations(date),
  );
  const associations = useQuery<{ id: number; name: string }[]>(
    ['associations'],
    () => api.getAssociations(),
  );

  const go = (to: string) => history.push(`/schedules/${to}`);
  const shift = (days: number) =>
    go(moment(date).add(days, 'day').format('YYYY-MM-DD'));

  const longDate = i18n.date(moment(date).toDate(), {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-4 pb-16 sm:px-6">
      <h1 className="font-semibold text-2xl">{t`Schedules`}</h1>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-black-tint-20 bg-white text-grey hover:border-black-tint-40 hover:text-black"
          onClick={() => shift(-1)}
          aria-label={t`Previous day`}
        >
          <ChevronLeftIcon fontSize="small" />
        </button>
        <DatePicker
          date={date}
          today={today}
          label={longDate.charAt(0).toUpperCase() + longDate.slice(1)}
          onPick={go}
        />
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-black-tint-20 bg-white text-grey hover:border-black-tint-40 hover:text-black"
          onClick={() => shift(1)}
          aria-label={t`Next day`}
        >
          <ChevronRightIcon fontSize="small" />
        </button>
        <button
          type="button"
          className={classNames(
            'rounded-md border px-3 py-1.5 font-medium text-sm',
            date === today
              ? 'border-black-tint-30 bg-black-tint-20 text-black'
              : 'border-black-tint-20 bg-white text-grey hover:border-black-tint-40 hover:text-black',
          )}
          aria-current={date === today ? 'date' : undefined}
          onClick={() => go(today)}
        >
          {t`Today`}
        </button>
      </div>

      {past && (
        <p
          className="border-black-tint-40 border-l-3 bg-black-tint-05 px-3 py-2 text-sm"
          data-testid="past-day"
        >
          <b className="font-semibold">{t`Past day`}</b>{' '}
          {t`It is shown read-only; past days cannot be changed.`}
        </p>
      )}

      {day.isLoading || sections.isLoading || reservations.isLoading ? (
        <div className="flex justify-center p-6">
          <CircularProgress disableShrink />
        </div>
      ) : day.isError || !day.data ? (
        <p role="alert">{t`The day could not be loaded.`}</p>
      ) : (
        <>
          <RangeCard day={day.data} associations={associations.data ?? []} />
          <h2 className="mt-2 font-semibold text-xl">{t`Tracks`}</h2>
          <div className="flex flex-col gap-4">
            {day.data.tracks.map((track: ApiTrackDay) => (
              <TrackCard
                key={track.id}
                track={track}
                sections={(sections.data ?? []).filter(
                  (s) => s.track_id === track.id,
                )}
                reservations={reservations.data ?? []}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SchedulesView;

/** The day from GET /api/datesupreme/:date, as far as this page reads it. */
interface ApiScheduleDay {
  available: boolean | null;
  open: string | null;
  close: string | null;
  rangeSupervisorId: number | null;
  rangeSupervision: string | null;
  arrivingAt: string | null;
  tracks: ApiTrackDay[];
}

interface ApiTrackDay {
  id: number;
  name: string;
  description: string | null;
  notice: string | null;
  trackSupervision: string | null;
}

function DatePicker({
  date,
  today,
  label,
  onPick,
}: {
  date: string;
  today: string;
  label: string;
  onPick: (date: string) => void;
}) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(date);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMonth(date);
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !box.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open, date]);

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        className="flex items-center gap-1 rounded-lg border border-black-tint-20 bg-white py-1.5 pr-2 pl-3 font-semibold hover:border-black-tint-40"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ArrowDropDownIcon fontSize="small" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t`Choose a date`}
          className="absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-xl border border-black-tint-20 bg-white p-3 shadow-lg"
        >
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            today={today}
            selected={[date]}
            onSelect={(picked) => {
              setOpen(false);
              onPick(picked);
            }}
          />
        </div>
      )}
    </div>
  );
}

function RangeCard({
  day,
  associations,
}: {
  day: ApiScheduleDay;
  associations: { id: number; name: string }[];
}) {
  const { t } = useLingui();
  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  const holder = associations.find((a) => a.id === day.rangeSupervisorId);
  const arriving = toMinutes(day.arrivingAt);

  const status = {
    present: t`Range officer present`,
    confirmed: t`Range officer confirmed`,
    'not confirmed': t`Range officer predefined`,
  }[day.rangeSupervision ?? ''];

  return (
    <section
      className="rounded-xl border border-black-tint-20 bg-white p-4 sm:p-5"
      aria-labelledby="range-card"
    >
      <h2 id="range-card" className="mb-3 font-semibold text-lg">
        {t`Range`}
      </h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="text-grey">{t`Range today`}</dt>
        <dd>{day.available ? t`Open` : t`Closed`}</dd>
        {open !== null && close !== null && (
          <>
            <dt className="text-grey">{t`Opening hours`}</dt>
            <dd className="tabular-nums">
              {formatTime(open)}–{formatTime(close)}
            </dd>
          </>
        )}
        <dt className="text-grey">{t`Range officer shift`}</dt>
        <dd>{holder?.name ?? t`No range officer`}</dd>
        {holder && (
          <>
            <dt className="text-grey">{t`Range officer status`}</dt>
            <dd>{status ?? '—'}</dd>
          </>
        )}
        {day.rangeSupervision === 'confirmed' && arriving !== null && (
          <>
            <dt className="text-grey">{t`Estimated arrival`}</dt>
            <dd className="tabular-nums">{formatTime(arriving)}</dd>
          </>
        )}
      </dl>
    </section>
  );
}

function TrackCard({
  track,
  sections,
  reservations,
}: {
  track: ApiTrackDay;
  sections: ApiSection[];
  reservations: ApiReservation[];
}) {
  const { t } = useLingui();
  const trackName = useTrackName();
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const sectionIds = ordered.map((s) => s.id);
  const own = reservations.filter((r) =>
    sectionIds.includes(r.track_section_id),
  );
  // Official use is one booking stored on every section; list it once.
  const official = own
    .filter((r) => r.type === 'official')
    .filter(
      (r, i, all) =>
        all.findIndex(
          (o) => o.start_time === r.start_time && o.end_time === r.end_time,
        ) === i,
    );
  const lanes = ordered.reduce((sum, s) => sum + s.lane_count, 0);

  const status =
    track.trackSupervision === 'closed'
      ? t`Closed`
      : track.trackSupervision === 'private_event'
        ? t`Private event`
        : t`Normal`;

  return (
    <section className="rounded-xl border border-black-tint-20 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-lg">{trackName(track.name)}</h3>
        <span
          className={classNames(
            'rounded-full border px-3 py-0.5 text-sm',
            track.trackSupervision === 'closed'
              ? 'border-black-tint-40 font-semibold'
              : 'border-black-tint-20',
          )}
        >
          {status}
        </span>
      </div>
      <p className="mt-1 text-grey text-sm tabular-nums">
        {lanes} {t`lanes`}
        {track.trackSupervision === 'present' && (
          <> · {t`Track officer present`}</>
        )}
      </p>
      {track.notice && (
        <p className="mt-3 border-grey border-l-3 bg-black-tint-05 py-2 pr-3 pl-3 text-sm">
          <b className="font-semibold">{t`Notice for the day`}</b>{' '}
          {track.notice}
        </p>
      )}

      <h4 className="mt-4 mb-1 font-semibold text-grey text-xs uppercase tracking-wider">
        {t`Bookings`}
      </h4>
      {own.length === 0 ? (
        <p className="text-grey text-sm">{t`No bookings`}</p>
      ) : (
        <ul className="list-none divide-y divide-black-tint-10 p-0 text-sm">
          {official.map((r) => (
            <BookingRow
              key={`official-${r.id}`}
              booking={r}
              where={t`Whole track`}
              total={lanes}
            />
          ))}
          {ordered.flatMap((section) =>
            own
              .filter(
                (r) =>
                  r.type !== 'official' && r.track_section_id === section.id,
              )
              .map((r) => (
                <BookingRow
                  key={r.id}
                  booking={r}
                  where={ordered.length > 1 ? section.name : undefined}
                  total={section.lane_count}
                />
              )),
          )}
        </ul>
      )}
    </section>
  );
}

function BookingRow({
  booking,
  where,
  total,
}: {
  booking: ApiReservation;
  where?: string;
  total: number;
}) {
  const { t } = useLingui();
  const start = toMinutes(booking.start_time);
  const end = toMinutes(booking.end_time);
  const type = {
    private_event: t`Private event`,
    official: t`Reserved for authority use`,
    closed: t`Closed`,
  }[booking.type];

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <span className="w-28 shrink-0 tabular-nums">
        {start !== null &&
          end !== null &&
          `${formatTime(start)}–${formatTime(end)}`}
      </span>
      <span className="min-w-0 flex-1">
        <b className="font-semibold">{type}</b>
        {booking.association_name && <> · {booking.association_name}</>}
        {where && <span className="text-grey"> · {where}</span>}
        {booking.description && (
          <span className="block text-grey">{booking.description}</span>
        )}
      </span>
      <span className="text-grey tabular-nums">
        {booking.type === 'official'
          ? t`All lanes`
          : `${booking.lanes_used}/${total}`}
      </span>
    </li>
  );
}
