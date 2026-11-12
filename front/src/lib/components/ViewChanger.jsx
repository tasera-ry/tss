import { useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import moment from 'moment';

export function ViewChanger() {
  const { t } = useLingui();
  const { date: dateParam } = useParams();
  const location = useLocation();

  const targetDate = useMemo(
    () => dateParam ?? moment().format('YYYY-MM-DD'),
    [dateParam]
  );

  const baseTabStyle =
    'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors';
  const activeTabStyle =
    'bg-black-tint-70 border-black-tint-70 text-white';
  const inactiveTabStyle =
    'bg-white border-black-tint-20 text-grey hover:border-black-tint-40 hover:text-black';

  const isMonth = location.pathname.includes('/monthview');
  const isWeek = location.pathname.includes('/weekview');
  const isDay = location.pathname.includes('/dayview');
  const isTrack = location.pathname.includes('/trackview');

  return (
    <nav aria-label={t`Views`} className="flex gap-1">
      <Link
        className={`${baseTabStyle} ${isMonth ? activeTabStyle : inactiveTabStyle}`}
        to={`/monthview/${targetDate}`}
      >
        {t`Month`}
      </Link>
      <Link
        className={`${baseTabStyle} ${isWeek ? activeTabStyle : inactiveTabStyle}`}
        to={`/weekview/${targetDate}`}
      >
        {t`Week`}
      </Link>
      <Link
        className={`${baseTabStyle} ${isDay ? activeTabStyle : inactiveTabStyle}`}
        to={`/dayview/${targetDate}`}
      >
        {t`Day`}
      </Link>
      {isTrack && (
        <span
          aria-current="page"
          className={`${baseTabStyle} ${activeTabStyle}`}
        >
          {t`Track`}
        </span>
      )}
    </nav>
  );
}