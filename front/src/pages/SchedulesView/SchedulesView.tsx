import { useLingui } from '@lingui/react/macro';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CircularProgress } from '@mui/material';
import classNames from 'classnames';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { Prompt, useHistory, useParams } from 'react-router-dom';

import api from '@/api/api';
import {
  type ApiReservation,
  type ApiSection,
  formatTime,
  toMinutes,
} from '@/trackview/trackViewPlaceholder';
import { validateLogin } from '@/utils/Utils';
import { MonthCalendar } from './MonthCalendar';
import { TrackCard } from './TrackCard';
import type { ApiScheduleDay, ApiTrackDay, Association } from './types';

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
  const associations = useQuery<Association[]>(['associations'], () =>
    api.getAssociations(),
  );

  // Cards with unsaved changes: leaving the day would lose them.
  const [unsaved, setUnsaved] = useState<number[]>([]);
  const onDirtyChange = useCallback((trackId: number, dirty: boolean) => {
    setUnsaved((ids) => {
      if (dirty === ids.includes(trackId)) return ids;
      return dirty ? [...ids, trackId] : ids.filter((id) => id !== trackId);
    });
  }, []);
  useEffect(() => {
    if (unsaved.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved.length]);

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
      <Prompt
        when={unsaved.length > 0}
        message={t`A track has unsaved changes. Leave without saving?`}
      />

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
          <p className="-mt-3 text-grey text-sm">
            {t`Track officers are marked present on the tablet. Here you set each track's status, notice and bookings.`}
          </p>
          <div className="flex flex-col gap-4">
            {day.data.tracks.map((track: ApiTrackDay) => (
              <TrackCard
                key={`${date}-${track.id}`}
                day={day.data}
                track={track}
                sections={(sections.data ?? []).filter(
                  (s) => s.track_id === track.id,
                )}
                reservations={reservations.data ?? []}
                associations={associations.data ?? []}
                past={past}
                onDirtyChange={onDirtyChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SchedulesView;

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
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Start from the chosen day, as a date picker does.
    box.current
      ?.querySelector<HTMLButtonElement>('dialog button[aria-pressed="true"]')
      ?.focus();
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
        setOpen(false);
        trigger.current?.focus();
      } else if (!box.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button
        ref={trigger}
        type="button"
        className="flex items-center gap-1 rounded-lg border border-black-tint-20 bg-white py-1.5 pr-2 pl-3 font-semibold hover:border-black-tint-40"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setMonth(date);
          setOpen(!open);
        }}
      >
        {label}
        <ArrowDropDownIcon fontSize="small" />
      </button>
      {open && (
        <dialog
          open
          aria-label={t`Choose date`}
          className="absolute top-full left-1/2 z-10 m-0 mt-2 -translate-x-1/2 rounded-xl border border-black-tint-20 bg-white p-3 shadow-lg"
        >
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            today={today}
            selected={[date]}
            onSelect={(picked) => {
              setOpen(false);
              trigger.current?.focus();
              onPick(picked);
            }}
          />
        </dialog>
      )}
    </div>
  );
}

function RangeCard({
  day,
  associations,
}: {
  day: ApiScheduleDay;
  associations: Association[];
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
