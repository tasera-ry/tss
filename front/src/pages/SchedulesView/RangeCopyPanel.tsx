import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import api from '@/api/api';
import { formatTime, toMinutes } from '@/trackview/trackViewPlaceholder';
import { MonthCalendar } from './MonthCalendar';
import type { RangeSettings } from './RangeCard';

/**
 * Copy the range's day to other days (#463): what the old page's "Repeat"
 * did for the range. The admin clicks the days and ticks what goes with them;
 * one save, all or nothing.
 */
export function RangeCopyPanel({
  date,
  settings,
  holderName,
  onDone,
}: {
  /** The day copied from. */
  date: string;
  /** The day's settings as saved. */
  settings: RangeSettings;
  holderName: string;
  onDone: (copiedTo?: number) => void;
}) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const today = moment().format('YYYY-MM-DD');
  const [month, setMonth] = useState(date);
  const [dates, setDates] = useState<string[]>([]);
  const [withStatus, setWithStatus] = useState(true);
  const [withHours, setWithHours] = useState(true);
  const [withHolder, setWithHolder] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  const chosen = dates.length;
  const hours = `${formatTime(toMinutes(settings.open) ?? 0)}–${formatTime(toMinutes(settings.close) ?? 0)}`;

  function toggle(day: string) {
    setDates((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(),
    );
  }

  async function copy() {
    setSaving(true);
    setError(null);
    try {
      await api.putRangeDay({
        dates,
        ...(withStatus ? { available: settings.available } : {}),
        ...(withHours ? { open: settings.open, close: settings.close } : {}),
        ...(withHolder ? { association_id: settings.associationId } : {}),
      });
      await queryClient.invalidateQueries(['schedulesDay']);
      onDone(dates.length);
    } catch {
      setError(t`Nothing was copied: the copy could not be saved.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="mt-4 flex flex-col gap-3 rounded-lg bg-black-tint-05 p-4"
      aria-labelledby="copy-range"
    >
      <h3
        id="copy-range"
        ref={heading}
        tabIndex={-1}
        className="font-semibold focus:outline-none"
      >
        {t`Copy to other days`}
      </h3>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1 font-medium">{t`Copy`}</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={withStatus}
            onChange={(e) => setWithStatus(e.target.checked)}
          />
          {t`Range today`}: {settings.available ? t`Open` : t`Closed`}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={withHours}
            onChange={(e) => setWithHours(e.target.checked)}
          />
          <span>
            {t`Opening hours`}: <span className="tabular-nums">{hours}</span>
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={withHolder}
            onChange={(e) => setWithHolder(e.target.checked)}
          />
          {t`Range officer shift`}: {holderName || t`No range officer`}
        </label>
      </fieldset>

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
          disabled={
            saving || chosen === 0 || !(withStatus || withHours || withHolder)
          }
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
