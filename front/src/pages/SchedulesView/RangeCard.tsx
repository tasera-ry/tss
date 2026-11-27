import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import api from '@/api/api';
import { formatTime, toMinutes } from '@/trackview/trackViewPlaceholder';
import { RangeCopyPanel } from './RangeCopyPanel';
import type { ApiScheduleDay, Association } from './types';

/** The range card's editable settings; times as 'HH:MM'. */
export interface RangeSettings {
  available: boolean;
  open: string;
  close: string;
  associationId: number | null;
}

/** The day as stored; a day without rows reads as closed, 17–20. */
function storedSettings(day: ApiScheduleDay): RangeSettings {
  return {
    available: day.available === true,
    open: day.open?.slice(0, 5) ?? '17:00',
    close: day.close?.slice(0, 5) ?? '20:00',
    associationId: day.rangeSupervisorId ?? null,
  };
}

const same = (a: RangeSettings, b: RangeSettings) =>
  a.available === b.available &&
  a.open === b.open &&
  a.close === b.close &&
  a.associationId === b.associationId;

// A chip's keyboard focus is drawn on its label: the radio itself is hidden.
const chip =
  'cursor-pointer rounded-full border border-black-tint-20 px-3 py-1 text-sm has-[:checked]:border-black has-[:checked]:bg-black-tint-05 has-[:checked]:font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-black has-[:focus-visible]:outline-offset-2';

/**
 * The range for one day (#463): open or closed, opening hours and the range
 * officer's association. The admin chooses only the association; its status
 * follows on the server (a new holder is asked to confirm by email). Read-only
 * on a past day.
 */
export function RangeCard({
  day,
  associations,
  past,
  onDirtyChange,
}: {
  day: ApiScheduleDay;
  associations: Association[];
  past: boolean;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const stored = storedSettings(day);
  const [draft, setDraft] = useState(stored);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [copying, setCopying] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const copyButton = useRef<HTMLButtonElement>(null);

  const dirty = !same(draft, stored);
  const hoursValid =
    draft.open !== '' && draft.close !== '' && draft.open < draft.close;
  const nameOf = (id: number | null) =>
    associations.find((a) => a.id === id)?.name ?? '';

  // Follow the server (a refetch, another admin, a confirmation) while the
  // card has no edits of its own; never overwrite edits in progress.
  const previous = useRef(stored);
  useEffect(() => {
    const before = previous.current;
    if (!same(before, stored)) {
      setDraft((current) => (same(current, before) ? stored : current));
      previous.current = stored;
    }
  });

  useEffect(() => {
    onDirtyChange(dirty);
    if (dirty) setAnnouncement('');
  }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const status = {
    present: t`Range officer present`,
    confirmed: t`Range officer confirmed`,
    'not confirmed': t`Range officer predefined`,
  }[day.rangeSupervision ?? ''];
  const arriving =
    day.rangeSupervision === 'confirmed' ? toMinutes(day.arrivingAt) : null;
  const holderChanged = draft.associationId !== stored.associationId;

  async function save() {
    setSaving(true);
    setError(null);
    setAnnouncement('');
    try {
      // Only what changed: the server keeps the rest as it is now.
      await api.putRangeDay({
        dates: [day.date],
        ...(draft.available !== stored.available
          ? { available: draft.available }
          : {}),
        ...(draft.open !== stored.open || draft.close !== stored.close
          ? { open: draft.open, close: draft.close }
          : {}),
        ...(holderChanged ? { association_id: draft.associationId } : {}),
      });
      setAnnouncement(t`Saved`);
      heading.current?.focus();
    } catch {
      setError(t`The range could not be saved.`);
    } finally {
      // The track cards need the day's row ids before they save: wait for them.
      await queryClient.invalidateQueries(['schedulesDay', day.date]);
      setSaving(false);
    }
  }

  function closeCopy(copiedTo?: number) {
    setCopying(false);
    if (copiedTo) {
      setAnnouncement(
        t({
          message: plural(copiedTo, {
            one: 'Copied to # day.',
            other: 'Copied to # days.',
          }),
        }),
      );
    }
    requestAnimationFrame(() => copyButton.current?.focus());
  }

  const officerStatus = !holderChanged && stored.associationId !== null && (
    <>
      <dt className="text-grey">{t`Range officer status`}</dt>
      <dd>{status ?? '—'}</dd>
      {arriving !== null && (
        <>
          <dt className="text-grey">{t`Estimated arrival`}</dt>
          <dd className="tabular-nums">{formatTime(arriving)}</dd>
        </>
      )}
    </>
  );

  if (past) {
    const open = toMinutes(day.open);
    const close = toMinutes(day.close);
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
          <dd>{nameOf(stored.associationId) || t`No range officer`}</dd>
          {officerStatus}
        </dl>
      </section>
    );
  }

  return (
    <section
      className={classNames(
        'rounded-xl border bg-white p-4 sm:p-5',
        dirty ? 'border-black-tint-70' : 'border-black-tint-20',
      )}
      aria-labelledby="range-card"
    >
      <h2
        id="range-card"
        ref={heading}
        tabIndex={-1}
        className="mb-3 font-semibold text-lg focus:outline-none"
      >
        {t`Range`}
      </h2>

      <div className="flex flex-col gap-4 text-sm">
        <fieldset>
          <legend className="mb-1 text-grey">{t`Range today`}</legend>
          <div className="flex gap-1">
            {[true, false].map((available) => (
              <label key={String(available)} className={chip}>
                <input
                  type="radio"
                  name="range-available"
                  checked={draft.available === available}
                  onChange={() => setDraft({ ...draft, available })}
                  className="sr-only"
                />
                {available ? t`Open` : t`Closed`}
              </label>
            ))}
          </div>
        </fieldset>

        {draft.available && (
          <>
            <fieldset>
              <legend className="mb-1 text-grey">{t`Opening hours`}</legend>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1">
                  {t`Opens`}
                  <input
                    type="time"
                    className="rounded-md border border-black-tint-50 px-2 py-1.5 tabular-nums"
                    value={draft.open}
                    onChange={(e) =>
                      setDraft({ ...draft, open: e.target.value })
                    }
                    aria-describedby={
                      hoursValid ? undefined : 'range-hours-error'
                    }
                    aria-invalid={!hoursValid}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  {t`Closes`}
                  <input
                    type="time"
                    className="rounded-md border border-black-tint-50 px-2 py-1.5 tabular-nums"
                    value={draft.close}
                    onChange={(e) =>
                      setDraft({ ...draft, close: e.target.value })
                    }
                    aria-describedby={
                      hoursValid ? undefined : 'range-hours-error'
                    }
                    aria-invalid={!hoursValid}
                  />
                </label>
              </div>
              {!hoursValid && (
                <p id="range-hours-error" className="mt-1 font-medium">
                  ⚠ {t`The range must close after it opens.`}
                </p>
              )}
            </fieldset>

            <div>
              <label className="flex flex-col gap-1">
                <span className="text-grey">{t`Range officer shift`}</span>
                <select
                  className="w-full max-w-sm rounded-md border border-black-tint-50 bg-white px-2 py-1.5"
                  value={draft.associationId ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      associationId:
                        e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                >
                  <option value="">{t`No range officer`}</option>
                  {[...associations]
                    .sort((a, b) => a.name.localeCompare(b.name, 'fi'))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </label>
              {holderChanged && (
                <p className="mt-1 text-grey">
                  {draft.associationId !== null &&
                    t`Saving asks ${nameOf(draft.associationId)} by email to confirm the shift.`}{' '}
                  {stored.associationId !== null &&
                    t`${nameOf(stored.associationId)} is told of the change.`}
                </p>
              )}
              {officerStatus && (
                <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
                  {officerStatus}
                </dl>
              )}
            </div>
          </>
        )}
      </div>

      {copying ? (
        <RangeCopyPanel
          date={day.date}
          settings={stored}
          holderName={nameOf(stored.associationId)}
          onDone={closeCopy}
        />
      ) : (
        <div className="mt-4 flex justify-end">
          {/* What is copied is what is saved: save or undo edits first. */}
          <button
            ref={copyButton}
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-black-tint-50 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
            onClick={() => {
              setAnnouncement('');
              setCopying(true);
            }}
            disabled={dirty}
          >
            <ContentCopyIcon sx={{ fontSize: 16 }} aria-hidden />
            {t`Copy to other days`}
          </button>
        </div>
      )}

      {dirty && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-black-tint-05 px-3 py-2">
          <span className="font-medium text-sm">{t`Unsaved changes`}</span>
          <span className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-black-tint-50 bg-white px-3 py-1.5 text-sm"
              onClick={() => {
                setDraft(stored);
                setError(null);
                heading.current?.focus();
              }}
            >
              {t`Undo`}
            </button>
            <button
              type="button"
              className="rounded-md bg-black-tint-70 px-4 py-1.5 font-medium text-sm text-white disabled:opacity-60"
              onClick={save}
              disabled={saving || !hoursValid}
            >
              {t`Save`}
            </button>
          </span>
        </div>
      )}
      <output className="mt-2 block text-grey text-sm empty:hidden">
        {!dirty && announcement}
      </output>
      {error && (
        <p role="alert" className="mt-2 font-medium text-sm">
          ⚠ {error}
        </p>
      )}
    </section>
  );
}
