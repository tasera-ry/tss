import { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/sv';
import { Link } from 'react-router-dom';
import texts from '../../texts/texts.json';


export function ViewChanger() {
  const { viewChanger } = texts; // eslint-disable-line
  const lang = localStorage.getItem('language');

  const time = useMemo(() => {
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[5];
    if (urlParamDate) return urlParamDate;

    return moment().format("YYYY-MM-DD");
  }, []);

  return (
    <div className='flex gap-1'>
      <Link
        key="month"
        className='bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold'
        to={`/monthview/${time}`}
      >
        {viewChanger.Month[lang]}
      </Link>
      <Link
        key="week"
        className='bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold'
        to={`/weekview/${time}`}
      >
        {viewChanger.Week[lang]}
      </Link>
      <Link
        key="day"
        className='bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold'
        to={`/dayview/${time}`}
      >
        {viewChanger.Day[lang]}
      </Link>
    </div>
  )
};
 