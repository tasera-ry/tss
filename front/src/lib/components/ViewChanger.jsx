import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import texts from '../../texts/texts.json';

export function ViewChanger() {
  const { viewChanger } = texts; // eslint-disable-line
  const lang = localStorage.getItem('language');

  const time = useMemo(() => {
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[5];
    if (urlParamDate) return urlParamDate;

    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }, []);

  return (
    <>
      <Link key="month" className="link" to={`/monthview/${time}`}>
        {viewChanger.Month[lang]}
      </Link>,
      <Link key="week" className="link" to={`/weekview/${time}`}>
        {viewChanger.Week[lang]}
      </Link>,
      <Link key="day" className="link" to={`/dayview/${time}`}>
        {viewChanger.Day[lang]}
      </Link>,
    </>
  )

};
