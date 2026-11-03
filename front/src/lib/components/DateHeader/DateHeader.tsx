import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import moment from 'moment';

export interface DateHeaderProps {
  targetDate: string;
  onPrevious: () => void;
  onNext: () => void;
  type?: 'week' | 'month' | 'day';
}

export function DateHeader({
  targetDate,
  onPrevious,
  onNext,
  type = 'day',
}: DateHeaderProps) {
  const { t, i18n } = useLingui();

  const date = useMemo(() => new Date(targetDate), [targetDate]);

  const dateString = useMemo(() => {
    const str = i18n.date(date, {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [date, i18n]);

  const weekString = useMemo(() => {
    const year = moment(date).year();
    const weekNumber = moment(date).isoWeek();
    return t`Week ${weekNumber} ${year}`;
  }, [date, t]);

  const monthString = useMemo(() => {
    const str = i18n.date(date, { month: 'long', year: 'numeric' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [date, i18n]);

  const label = useMemo(() => {
    switch (type) {
      case 'week':
        return weekString;
      case 'month':
        return monthString;
      case 'day':
        return dateString;
    }
  }, [type, weekString, monthString, dateString]);

  const arrowBtnStyle =
    'flex size-9 shrink-0 items-center justify-center rounded-lg border border-black-tint-20 bg-white text-grey transition-colors hover:border-black-tint-40 hover:text-black active:scale-95';

  return (
    <div className="grid grid-cols-[44px_1fr_44px] items-center justify-items-center w-full max-w-md mx-auto py-4">
      <button
        type="button"
        className={arrowBtnStyle}
        onClick={onPrevious}
        data-testid="previousDay"
        aria-label={t`Previous`}
      >
        <ChevronLeftIcon fontSize="small" />
      </button>

      <h1 className="w-full min-w-0 font-semibold text-base sm:text-xl text-center px-1 truncate">
        {label}
      </h1>

      <button
        type="button"
        className={arrowBtnStyle}
        onClick={onNext}
        data-testid="nextDay"
        aria-label={t`Next`}
      >
        <ChevronRightIcon fontSize="small" />
      </button>
    </div>
  );
}