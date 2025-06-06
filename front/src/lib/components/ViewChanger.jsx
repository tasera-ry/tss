import moment from 'moment';
import { useMemo } from 'react';
import 'moment/locale/sv';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';

export function ViewChanger() {
  const { t } = useLingui();

  const time = useMemo(() => {
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[5];
    if (urlParamDate) return urlParamDate;

    return moment().format('YYYY-MM-DD');
  }, []);

  return (
    <div className="flex gap-1">
      <Link
        key="month"
        className="bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold"
        to={`/monthview/${time}`}
      >
        {t`Month`}
      </Link>
      <Link
        key="week"
        className="bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold"
        to={`/weekview/${time}`}
      >
        {t`Week`}
      </Link>
      <Link
        key="day"
        className="bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold"
        to={`/dayview/${time}`}
      >
        {t`Day`}
      </Link>
    </div>
  );
}
