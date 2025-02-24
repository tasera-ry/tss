import classNames from 'classnames';
import { useWeekDay } from '../../../utils/dateUtils';
import css from './DateHeader.module.scss';
import { useMemo } from 'react';

const classes = classNames.bind(css);

export interface DateHeaderProps {
  targetDate: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function DateHeader({targetDate, onPrevious, onNext}: DateHeaderProps) {

  const date = useMemo(() => new Date(targetDate), [targetDate])

  const weekDay = useWeekDay(date, 'long')

  const dateString = useMemo(() => {
    return new Date(targetDate).toLocaleDateString('fi-FI');
  }, [targetDate])

  return (
    <div className="flex justify-center items-center py-10">
      <button
        className={classes(css.hoverHand, css.arrowLeft)}
        onClick={onPrevious}
        data-testid="previousDay"
      />
      <h1 className="font-bold text-[2em] px-5 text-center w-92">
        {`${weekDay} ${dateString}`}
      </h1>
      <button
        className={classes(css.hoverHand, css.arrowRight)}
        onClick={onNext}
        data-testid="nextDay"
      />
    </div>
  )
}
