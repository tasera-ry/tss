import React, { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/sv';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import texts from '../../texts/texts.json';
import colors from '../../colors.module.scss';


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
        <div>{viewChanger.Month[lang]}</div>
      </Link>,
      <Link key="week" className="link" to={`/weekview/${time}`}>
        <div>{viewChanger.Week[lang]}</div>
      </Link>,
      <Link key="day" className="link" to={`/dayview/${time}`}>
        <div>{viewChanger.Day[lang]}</div>
      </Link>,
    </>
  )

};
