import { useLingui } from "@lingui/react";
import moment from "moment";

export function useWeekDay(date: string | Date, weekday: Intl.DateTimeFormatOptions['weekday']) {
  const { i18n } = useLingui();
  let dayString = i18n.date(date, { weekday })
  return dayString.charAt(0).toUpperCase() + dayString.slice(1);
}

export function Weekday({date, weekday}: {date: string | Date, weekday: Intl.DateTimeFormatOptions['weekday']}) {
  const weekDayString = useWeekDay(date, weekday)
  return weekDayString
}

export function dateToString(date: string | Date) {
  return moment(date).format('YYYY-MM-DD')
};
