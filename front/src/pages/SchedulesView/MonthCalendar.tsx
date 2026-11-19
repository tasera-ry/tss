import { useLingui } from '@lingui/react/macro';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import classNames from 'classnames';
import moment from 'moment';

/**
 * One month as a grid of day buttons, Monday first.
 *
 * Used to pick the day to edit, and (later) the days to copy a track's details
 * to, so selection is a list. Days before `disableBefore` cannot be chosen:
 * past days are read-only (Pasi Autio, 13.11.2026).
 */
export function MonthCalendar({
  month,
  onMonthChange,
  today,
  selected,
  onSelect,
  disableBefore,
}: {
  /** Any date in the month to show, YYYY-MM-DD. */
  month: string;
  onMonthChange: (month: string) => void;
  today: string;
  selected: string[];
  onSelect: (date: string) => void;
  disableBefore?: string;
}) {
  const { t } = useLingui();
  const first = moment(month).startOf('month');
  const lead = first.isoWeekday() - 1;
  const days = Array.from({ length: first.daysInMonth() }, (_, i) =>
    first.clone().add(i, 'day').format('YYYY-MM-DD'),
  );
  const cells: (string | null)[] = [...Array(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    moment()
      .isoWeekday(i + 1)
      .format('dd'),
  );
  const title = first.format('MMMM YYYY');

  return (
    <div className="w-80 max-w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-black-tint-20 bg-white text-grey hover:border-black-tint-40 hover:text-black"
          onClick={() =>
            onMonthChange(
              first.clone().subtract(1, 'month').format('YYYY-MM-DD'),
            )
          }
          aria-label={t`Previous month`}
        >
          <ChevronLeftIcon fontSize="small" />
        </button>
        <span className="font-semibold capitalize" aria-live="polite">
          {title}
        </span>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg border border-black-tint-20 bg-white text-grey hover:border-black-tint-40 hover:text-black"
          onClick={() =>
            onMonthChange(first.clone().add(1, 'month').format('YYYY-MM-DD'))
          }
          aria-label={t`Next month`}
        >
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center" role="grid">
        {weekdays.map((day) => (
          <span key={day} className="py-1 text-grey text-xs" aria-hidden>
            {day}
          </span>
        ))}
        {cells.map((date, i) =>
          date === null ? (
            <span key={`empty-${i}`} />
          ) : (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              disabled={disableBefore !== undefined && date < disableBefore}
              aria-pressed={selected.includes(date)}
              aria-current={date === today ? 'date' : undefined}
              aria-label={moment(date).format('dddd D.M.YYYY')}
              className={classNames(
                'h-9 rounded-md text-sm tabular-nums',
                'disabled:cursor-not-allowed disabled:text-black-tint-30',
                selected.includes(date)
                  ? 'bg-black-tint-70 font-semibold text-white'
                  : 'hover:bg-black-tint-10',
                date === today &&
                  !selected.includes(date) &&
                  'font-semibold ring-1 ring-black-tint-40 ring-inset',
              )}
            >
              {moment(date).date()}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
