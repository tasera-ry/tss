import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import { useState } from 'react';
import { useQueryClient } from 'react-query';

import api from '@/api/api';
import {
  type ApiReservation,
  type ApiSection,
  formatTime,
  toMinutes,
} from '@/trackview/trackViewPlaceholder';
import { usePositionName, useTrackName } from '@/trackview/useTrackName';
import { BookingForm } from './BookingForm';
import { ensureDayRows } from './dayRows';
import type { ApiScheduleDay, ApiTrackDay, Association } from './types';

type Status = 'normal' | 'closed' | 'private';

function statusOf(supervisor: string | null): Status {
  if (supervisor === 'closed') return 'closed';
  if (supervisor === 'private_event') return 'private';
  return 'normal';
}

/**
 * The stored value for a chosen status. "Normal" keeps what the tablet set:
 * the track officer's presence is marked there, never on this page.
 */
function supervisorFor(status: Status, current: string | null): string {
  if (status === 'closed') return 'closed';
  if (status === 'private') return 'private_event';
  return current === 'present' ? 'present' : 'absent';
}

/**
 * One track for one day: its status and notice, saved on their own, and its
 * bookings. Read-only on a past day.
 */
export function TrackCard({
  day,
  track,
  sections,
  reservations,
  associations,
  past,
}: {
  day: ApiScheduleDay;
  track: ApiTrackDay;
  /** The track's sections, in any order. */
  sections: ApiSection[];
  reservations: ApiReservation[];
  associations: Association[];
  past: boolean;
}) {
  const { t } = useLingui();
  const trackName = useTrackName();
  const queryClient = useQueryClient();

  const stored = statusOf(track.trackSupervision);
  const storedNotice = track.notice ?? '';
  const [status, setStatus] = useState<Status>(stored);
  const [notice, setNotice] = useState(storedNotice);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<'new' | ApiReservation | null>(null);
  const dirty = status !== stored || notice !== storedNotice;

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
  const choices: Status[] =
    stored === 'private'
      ? ['normal', 'closed', 'private']
      : ['normal', 'closed'];
  const statusLabel = {
    normal: t`Normal`,
    closed: t`Closed`,
    private: t`Private event`,
  };

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const ids = await ensureDayRows(day);
      const body = {
        track_supervisor: supervisorFor(status, track.trackSupervision),
        notice: notice.trim(),
      };
      if (track.scheduled && day.scheduleId !== null) {
        await api.patchScheduledSupervisionTrack(
          ids.scheduleId,
          track.id,
          body,
        );
      } else {
        await api.postScheduledSupervisionTrack({
          scheduled_range_supervision_id: ids.scheduleId,
          track_id: track.id,
          ...body,
        });
      }
      await queryClient.invalidateQueries(['schedulesDay', day.date]);
    } catch {
      setError(t`The track could not be saved.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={classNames(
        'rounded-xl border bg-white p-4 sm:p-5',
        dirty ? 'border-black-tint-70' : 'border-black-tint-20',
      )}
      aria-label={trackName(track.name)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg">{trackName(track.name)}</h3>
          <p className="mt-1 text-grey text-sm tabular-nums">
            {lanes} {t`lanes`}
            {track.trackSupervision === 'present' && (
              <> · {t`Track officer present`}</>
            )}
          </p>
        </div>
        {past ? (
          <span className="rounded-full border border-black-tint-20 px-3 py-0.5 text-sm">
            {statusLabel[stored]}
          </span>
        ) : (
          <fieldset>
            <legend className="mb-1 text-grey text-sm">{t`Track status`}</legend>
            <div className="flex gap-1">
              {choices.map((choice) => (
                <label
                  key={choice}
                  className="cursor-pointer rounded-full border border-black-tint-20 px-3 py-1 text-sm has-[:checked]:border-black has-[:checked]:bg-black-tint-05 has-[:checked]:font-medium"
                >
                  <input
                    type="radio"
                    name={`status-${track.id}`}
                    value={choice}
                    checked={status === choice}
                    onChange={() => setStatus(choice)}
                    className="sr-only"
                  />
                  {statusLabel[choice]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {past ? (
        storedNotice && (
          <p className="mt-3 border-grey border-l-3 bg-black-tint-05 py-2 pr-3 pl-3 text-sm">
            <b className="font-semibold">{t`Notice for the day`}</b>{' '}
            {storedNotice}
          </p>
        )
      ) : (
        <label className="mt-3 block">
          <span className="mb-1 block font-medium text-sm">
            {t`Notice for the day`}
          </span>
          <input
            type="text"
            className="w-full rounded-md border border-black-tint-30 px-2 py-1.5 text-sm"
            value={notice}
            maxLength={255}
            placeholder={t`No notice`}
            onChange={(e) => setNotice(e.target.value)}
          />
        </label>
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
              past={past}
              onEdit={() => setForm(r)}
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
                  past={past}
                  onEdit={() => setForm(r)}
                />
              )),
          )}
        </ul>
      )}

      {!past &&
        (form ? (
          <BookingForm
            key={form === 'new' ? 'new' : form.id}
            date={day.date}
            sections={ordered}
            associations={associations}
            booking={form === 'new' ? undefined : form}
            onDone={() => setForm(null)}
          />
        ) : (
          <button
            type="button"
            className="mt-3 rounded-md border border-black-tint-30 bg-white px-3 py-1.5 text-sm"
            onClick={() => setForm('new')}
            disabled={ordered.length === 0}
          >
            + {t`Add booking`}
          </button>
        ))}

      {!past && dirty && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-black-tint-05 px-3 py-2">
          <span className="font-medium text-sm">{t`Unsaved changes`}</span>
          <span className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-black-tint-30 bg-white px-3 py-1.5 text-sm"
              onClick={() => {
                setStatus(stored);
                setNotice(storedNotice);
                setError(null);
              }}
            >
              {t`Undo`}
            </button>
            <button
              type="button"
              className="rounded-md bg-black-tint-70 px-4 py-1.5 font-medium text-sm text-white disabled:opacity-60"
              onClick={save}
              disabled={saving}
            >
              {t`Save`}
            </button>
          </span>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 font-medium text-sm">
          ⚠ {error}
        </p>
      )}
    </section>
  );
}

function BookingRow({
  booking,
  where,
  total,
  past,
  onEdit,
}: {
  booking: ApiReservation;
  where?: string;
  total: number;
  past: boolean;
  onEdit: () => void;
}) {
  const { t } = useLingui();
  const positionName = usePositionName();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const start = toMinutes(booking.start_time);
  const end = toMinutes(booking.end_time);
  const type = {
    private_event: t`Private event`,
    official: t`Reserved for authority use`,
    closed: t`Closed`,
  }[booking.type];

  async function remove() {
    await api.deleteTrackReservation(booking.id);
    await queryClient.invalidateQueries(['trackReservations']);
  }

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
        {where && <span className="text-grey"> · {positionName(where)}</span>}
        {booking.description && (
          <span className="block text-grey">{booking.description}</span>
        )}
      </span>
      <span className="text-grey tabular-nums">
        {booking.type === 'official'
          ? t`All lanes`
          : `${booking.lanes_used}/${total}`}
      </span>
      {!past &&
        (confirming ? (
          <span className="flex items-center gap-2">
            <span className="text-sm">{t`Delete this booking?`}</span>
            <button
              type="button"
              className="rounded-md border border-black-tint-70 px-2 py-1 text-sm"
              onClick={remove}
            >
              {t`Delete`}
            </button>
            <button
              type="button"
              className="px-2 py-1 text-grey text-sm"
              onClick={() => setConfirming(false)}
            >
              {t`Cancel`}
            </button>
          </span>
        ) : (
          <span className="flex gap-2">
            <button
              type="button"
              className="px-2 py-1 text-grey text-sm hover:text-black"
              onClick={onEdit}
            >
              {t`Edit`}
            </button>
            <button
              type="button"
              className="px-2 py-1 text-grey text-sm hover:text-black"
              onClick={() => setConfirming(true)}
            >
              {t`Delete`}
            </button>
          </span>
        ))}
    </li>
  );
}
