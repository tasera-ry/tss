import api from "@/api/api";
import moment from "moment";
import { QueryFunction } from "react-query";

export const schedulingFreeformQuery: QueryFunction<any[], ['schedulingFreeformMonth', string]> = async ({ queryKey }) => {
  const [, date] = queryKey;
  const firstDate = moment(date).startOf('month').format('YYYY-MM-DD');
  const lastDate = moment(date).endOf('month').format('YYYY-MM-DD');
  return api.getSchedulingFreeform(firstDate, lastDate);
}
