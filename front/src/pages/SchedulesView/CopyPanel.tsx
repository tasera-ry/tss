import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import api from '@/api/api';
import {
  type ApiReservation,
  formatTime,
  toMinutes,
} from '@/trackview/trackViewPlaceholder';
import { MonthCalendar } from './MonthCalendar';

interface Conflict {
  date: string;
  free: number;
  total: number;
}

/** A booking as the copy endpoint takes it: no date, no id. */
function bookingToCopy(booking: ApiReservation) {
  const common = {
    type: booking.type,
    start_time: booking.start_time.slice(0, 5),
    end_time: booking.end_time.slice(0, 5),
    description: booking.description,
  };
  return booking.type === 'official'
    ? common
    : {
        ...common,
        track_section_id: booking.track_section_id,
        lanes_used: booking.lanes_used,
        association_id: booking.association_id,
      };
}

/**
 * Copy a track's day to other days (#463, decided 18.11.2026): the admin
 * clicks the days in a month calendar and ticks what goes with them. One save,
 * all or nothing: if a booking does not fit on some day, nothing is copied and
 * those days are marked with the lanes still free.
 *
 * With `booking`, it repeats that one booking ("Repeat") and nothing else.
 */
export function CopyPanel({
  date,
  trackId,
  trackSupervisor,
  notice,
  bookings,
  booking,
  onDone,
}: {
  /** The day copied from. */
  date: string;
  trackId: number;
  /** The track's status as stored: absent, closed or private_event. */
  trackSupervisor: string;
  notice: string;
  /** The track's bookings on the day, official use once. */
  bookings: ApiReservation[];
  /** Repeat only this booking. */
  booking?: ApiReservation;
  onDone: (copiedTo?: number) => void;
}) {
  const { t, i18n } = useLingui();
  const queryClient = useQueryClient();
  const today = moment().format('YYYY-MM-DD');
  const [month, setMonth] = useState(date);
  const [dates, setDates] = useState<string[]>([]);
  const [withStatus, setWithStatus] = useState(true);
  const [withNotice, setWithNotice] = useState(notice !== '');
  const [withBookings, setWithBookings] = useState(false);
  const [refused, setRefused] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  const statusLabel =
    {
      closed: t`Closed`,
      private_event: t`Private event`,
    }[trackSupervisor] ?? t`Normal`;
  const chosen = dates.length;
  const nothing = booking
    ? false
    : !withStatus && !withNotice && !(withBookings && bookings.length > 0);

  function toggle(day: string) {
    setDates((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(),
    );
    setRefused(({ [day]: _, ...rest }) => rest);
  }

  async function copy() {
    setSaving(true);
    setError(null);
    try {
      await api.copyTrackDay({
        track_id: trackId,
        dates,
        ...(booking
          ? { reservations: [bookingToCopy(booking)] }
          : {
              ...(withStatus ? { track_supervisor: trackSupervisor } : {}),
              ...(withNotice ? { notice } : {}),
              ...(withBookings && bookings.length > 0
                ? { reservations: bookings.map(bookingToCopy) }
                : {}),
            }),
      });
      await Promise.all([
        queryClient.invalidateQueries(['schedulesDay']),
        queryClient.invalidateQueries(['trackReservations']),
      ]);
      onDone(dates.length);
    } catch (e) {
      const response = (
        e as {
          response?: { status: number; data?: { conflicts?: Conflict[] } };
        }
      ).response;
      const conflicts = response?.data?.conflicts;
      if (response?.status === 409 && conflicts) {
        setRefused(
          Object.fromEntries(
            conflicts.map(({ date, free, total }) => [
              date,
              t`${free}/${total} free`,
            ]),
          ),
        );
        const days = conflicts
          .map((c) =>
            i18n.date(moment(c.date).toDate(), {
              day: 'numeric',
              month: 'numeric',
            }),
          )
          .join(', ');
        setError(
          t`Nothing was copied: the bookings do not fit on ${days}. Remove those days or change the bookings, then try again.`,
        );
      } else {
        setError(t`Nothing was copied: the copy could not be saved.`);
      }
    } finally {
      setSaving(false);
    }
  }

  const start = booking ? toMinutes(booking.start_time) : null;
  const end = booking ? toMinutes(booking.end_time) : null;

  return (
    <section
      className="mt-3 flex flex-col gap-3 rounded-lg bg-black-tint-05 p-4"
      aria-labelledby={`copy-${trackId}`}
    >
      <h4
        id={`copy-${trackId}`}
        ref={heading}
        tabIndex={-1}
        className="font-semibold focus:outline-none"
      >
        {booking ? t`Repeat booking` : t`Copy to other days`}
      </h4>
      {booking ? (
        <p className="text-sm">
          {start !== null && end !== null && (
            <span className="tabular-nums">
              {formatTime(start)}–{formatTime(end)}{' '}
            </span>
          )}
          {
            {
              private_event: t`Private event`,
              official: t`Reserved for authority use`,
              closed: t`Closed`,
            }[booking.type]
          }
          {booking.association_name && <> · {booking.association_name}</>}
        </p>
      ) : (
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium">{t`Copy`}</legend>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={withStatus}
              onChange={(e) => setWithStatus(e.target.checked)}
            />
            {t`Track status`}: {statusLabel}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={withNotice}
              onChange={(e) => setWithNotice(e.target.checked)}
            />
            {t`Notice for the day`}: {notice || t`No notice`}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={withBookings}
              disabled={bookings.length === 0}
              onChange={(e) => setWithBookings(e.target.checked)}
            />
            {t`Bookings`} ({bookings.length})
          </label>
        </fieldset>
      )}

      <div>
        <p className="mb-2 font-medium text-sm">
          {t`Days`}
          <span className="font-normal text-grey">
            {' '}
            · {t`Chosen: ${chosen}`}
          </span>
        </p>
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          today={today}
          selected={dates}
          onSelect={toggle}
          disableBefore={today}
          disabledDates={[date]}
          refused={refused}
        />
      </div>

      {error && (
        <p role="alert" className="font-medium text-sm">
          ⚠ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={saving || dates.length === 0 || nothing}
          className="rounded-md bg-black-tint-70 px-4 py-1.5 font-medium text-sm text-white disabled:opacity-60"
        >
          {t({
            message: plural(chosen, {
              one: 'Copy to # day',
              other: 'Copy to # days',
            }),
          })}
        </button>
        <button
          type="button"
          onClick={() => onDone()}
          className="rounded-md border border-black-tint-50 bg-white px-4 py-1.5 text-sm"
        >
          {t`Cancel`}
        </button>
      </div>
    </section>
  );
}
