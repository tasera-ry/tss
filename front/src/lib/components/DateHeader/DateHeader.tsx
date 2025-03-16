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
  }, [date, i18n]);

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

  return (
    <div className="flex justify-center items-center py-10">
      <button
        className={classes(css.hoverHand, css.arrowLeft)}
        onClick={onPrevious}
        data-testid="previousDay"
      />
      <h1 className="font-bold text-[2em] px-5 text-center w-92 text-nowrap">
        {label}
      </h1>
      <button
        className={classes(css.hoverHand, css.arrowRight)}
        onClick={onNext}
        data-testid="nextDay"
      />
    </div>
  );
}
