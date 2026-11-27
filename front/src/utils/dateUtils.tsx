import moment from 'moment';

export function dateToString(date: string | Date) {
  return moment(date).format('YYYY-MM-DD');
}
