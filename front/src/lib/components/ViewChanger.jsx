import { useLingui } from '@lingui/react/macro';
import moment from 'moment';
import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

export function ViewChanger() {
  const { t } = useLingui();
  const { date: dateParam } = useParams();
  const location = useLocation();

  const targetDate = useMemo(
    () => dateParam ?? moment().format('YYYY-MM-DD'),
    [dateParam],
  );

  const baseTabStyle =
    'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors';
  const activeTabStyle = 'bg-black-tint-70 border-black-tint-70 text-white';
  const inactiveTabStyle =
    'bg-white border-black-tint-20 text-grey hover:border-black-tint-40 hover:text-black';

  const isMonth = location.pathname.includes('/monthview');
  // "/" renders the week view (App.tsx).
  const isWeek =
    location.pathname === '/' || location.pathname.includes('/weekview');
  const isDay = location.pathname.includes('/dayview');

  return (
    <nav aria-label={t`Views`} className="flex gap-1">
      <Link
        className={`${baseTabStyle} ${isMonth ? activeTabStyle : inactiveTabStyle}`}
        aria-current={isMonth ? 'page' : undefined}
        to={`/monthview/${targetDate}`}
      >
        {t`Month`}
      </Link>
      <Link
        className={`${baseTabStyle} ${isWeek ? activeTabStyle : inactiveTabStyle}`}
        aria-current={isWeek ? 'page' : undefined}
        to={`/weekview/${targetDate}`}
      >
        {t`Week`}
      </Link>
      <Link
        className={`${baseTabStyle} ${isDay ? activeTabStyle : inactiveTabStyle}`}
        aria-current={isDay ? 'page' : undefined}
        to={`/dayview/${targetDate}`}
      >
        {t`Day`}
      </Link>
    </nav>
  );
}
