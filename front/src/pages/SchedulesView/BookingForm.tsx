import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useQueryClient } from 'react-query';

import api from '@/api/api';
import type {
  ApiReservation,
  ApiSection,
} from '@/trackview/trackViewPlaceholder';
import { usePositionName } from '@/trackview/useTrackName';

type BookingType = 'private_event' | 'official';

const field =
  'w-full rounded-md border border-black-tint-30 bg-white px-2 py-1.5 text-sm';
const labelText = 'mb-1 block font-medium text-sm';

/**
 * Create or change one part-day booking on a track (#492's endpoints).
 *
 * Official use (military, police) always takes the whole track, so it has no
 * section, lanes or holder (Pasi Autio, 13.11.2026). The lanes are checked by
 * the database; a conflict comes back as 409 with what is still free. The type
 * cannot change once saved: delete and create instead.
 */
export function BookingForm({
  date,
  sections,
  associations,
  booking,
  onDone,
}: {
  date: string;
  /** The track's sections, in order. */
  sections: ApiSection[];
  associations: { id: number; name: string }[];
  /** The booking to change; none to create one. */
  booking?: ApiReservation;
  onDone: () => void;
}) {
  const { t } = useLingui();
  const positionName = usePositionName();
  const queryClient = useQueryClient();
  const editing = booking !== undefined;

  const [type, setType] = useState<BookingType>(
    booking?.type === 'official' ? 'official' : 'private_event',
  );
  const [start, setStart] = useState(booking?.start_time.slice(0, 5) ?? '');
  const [end, setEnd] = useState(booking?.end_time.slice(0, 5) ?? '');
  const [sectionId, setSectionId] = useState(
    booking?.track_section_id ?? sections[0]?.id,
  );
  const [lanes, setLanes] = useState(String(booking?.lanes_used ?? ''));
  const [holder, setHolder] = useState(
    booking?.association_id ? String(booking.association_id) : '',
  );
  const [description, setDescription] = useState(booking?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const section = sections.find((s) => s.id === sectionId) ?? sections[0];
  // Unique per form, for the ids that tie labels and descriptions to fields.
  const formId = `booking-${booking?.id ?? 'new'}-${sections[0]?.track_id}`;
  const official = type === 'official';

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!start || !end || start >= end) {
      setError(t`The booking must end after it starts.`);
      return;
    }
    const common = {
      start_time: start,
      end_time: end,
      description: description.trim() || null,
    };
    const body = official
      ? common
      : {
          ...common,
          track_section_id: section.id,
          lanes_used: Number(lanes),
          association_id: holder ? Number(holder) : null,
        };

    setSaving(true);
    try {
      if (editing) {
        await api.updateTrackReservation(booking.id, body);
      } else {
        await api.createTrackReservation({
          date,
          type,
          // Official use needs a section only to find the track.
          track_section_id: section.id,
          ...body,
        });
      }
      await queryClient.invalidateQueries(['trackReservations', date]);
      onDone();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setSaving(false);
    }
  }

  function describeError(e: unknown): string {
    const response = (
      e as {
        response?: {
          status: number;
          data?: { free?: number; total?: number; message?: string };
        };
      }
    ).response;
    if (response?.status === 409) {
      if (official)
        return t`The track is not free for authority use at that time.`;
      const free = response.data?.free ?? 0;
      const total = response.data?.total ?? section.lane_count;
      return t`Only ${free}/${total} lanes are free at that time.`;
    }
    if (response?.status === 400 && response.data?.message) {
      return response.data.message;
    }
    return t`The booking could not be saved.`;
  }

  return (
    <form
      onSubmit={save}
      className="mt-3 flex flex-col gap-3 rounded-lg bg-black-tint-05 p-4"
      aria-label={editing ? t`Change booking` : t`New booking`}
    >
      <h4 className="font-semibold">
        {editing ? t`Change booking` : t`New booking`}
      </h4>

      <div className="flex flex-wrap gap-3">
        <label className="w-28">
          <span className={labelText}>{t`Starts`}</span>
          <input
            type="time"
            className={field}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </label>
        <label className="w-28">
          <span className={labelText}>{t`Ends`}</span>
          <input
            type="time"
            className={field}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </label>
        <fieldset disabled={editing}>
          <legend className={labelText}>{t`Type`}</legend>
          <div className="flex gap-1">
            {(['private_event', 'official'] as const).map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm has-[:checked]:border-black has-[:checked]:bg-white has-[:checked]:font-medium ${editing ? 'cursor-not-allowed opacity-60' : 'border-black-tint-20'}`}
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={type === value}
                  onChange={() => setType(value)}
                  className="sr-only"
                />
                {value === 'official'
                  ? t`Reserved for authority use`
                  : t`Private event`}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {official ? (
        <p className="text-grey text-sm">
          {t`Authority use takes the whole track: every section and lane.`}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {sections.length > 1 && (
            <label className="w-56">
              <span className={labelText}>{t`Section`}</span>
              <select
                className={field}
                value={section.id}
                onChange={(e) => setSectionId(Number(e.target.value))}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {positionName(s.name)} ({s.lane_count})
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="w-36">
            <label htmlFor={`${formId}-lanes`} className={labelText}>
              {t`Lanes`}
            </label>
            <span className="flex items-center gap-2">
              <input
                id={`${formId}-lanes`}
                type="number"
                className={field}
                min={1}
                max={section.lane_count}
                value={lanes}
                onChange={(e) => setLanes(e.target.value)}
                aria-describedby={`${formId}-of`}
                required
              />
              <span id={`${formId}-of`} className="shrink-0 text-grey text-sm">
                / {section.lane_count}
              </span>
            </span>
          </div>
          <label className="w-64">
            <span className={labelText}>{t`Booked by`}</span>
            <select
              className={field}
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
            >
              <option value="">{t`No association`}</option>
              {associations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <label>
        <span className={labelText}>{t`Description (optional)`}</span>
        <input
          type="text"
          className={field}
          maxLength={255}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {error && (
        <p role="alert" className="font-medium text-sm">
          ⚠ {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-black-tint-70 px-4 py-1.5 font-medium text-sm text-white disabled:opacity-60"
        >
          {t`Save booking`}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-black-tint-30 bg-white px-4 py-1.5 text-sm"
        >
          {t`Cancel`}
        </button>
      </div>
    </form>
  );
}
