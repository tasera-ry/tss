import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import moment from 'moment';
import { useMemo } from 'react';
import css from './DateHeader.module.scss';

const classes = classNames.bind(css);

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
  }, [date, i18n.date]);

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

  return (
    <div className="grid grid-cols-[44px_1fr_44px] items-center justify-center w-full max-w-lg mx-auto py-4">
      <button
        type="button"
        className={classes(css.hoverHand, css.arrowLeft)}
        onClick={onPrevious}
        data-testid="previousDay"
      />
      <h1 className="font-bold text-base sm:text-2xl text-center px-2 min-w-0 w-full">
        {label}
      </h1>
      <button
        type="button"
        className={classes(css.hoverHand, css.arrowRight)}
        onClick={onNext}
        data-testid="nextDay"
      />
    </div>
  );
}