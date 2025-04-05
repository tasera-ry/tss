import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import './RaffleDatePicker.scss';
import { useLingui } from "@lingui/react";
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import api from '@/api/api';
import moment from "moment";
import { Language, useLanguageContext } from "@/i18n";
import { enGB, fi, sv, Locale, is } from "react-day-picker/locale";

const LOCALE: Record<Language, Locale> = {
  en: enGB,
  fi: fi,
  sv: sv,
};

const RaffleDatePicker = ({ selectedDays, setSelectedDays }) => {
  const [locale] = useLanguageContext();
  const { _ } = useLingui();
  const[month, setMonth] = useState(new Date());
  const scheduleQuery = useQuery({
   queryKey: ['schedulingFreeform', month],
   queryFn: () => {
    const firstDay = moment(month)
        .startOf('month')
        .startOf('isoWeek')
        .format('YYYY-MM-DD');
    const lastDay = moment(month)
      .endOf('month')
      .endOf('isoWeek')
      .format('YYYY-MM-DD');
    return api.getSchedulingFreeform(firstDay, lastDay);
  }
  });

  const notSetDays = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervisionScheduled && s.rangeSupervision === "absent")
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );

  const notConfirmedButSetDays = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervisionScheduled && s.rangeSupervision === 'not confirmed')
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );

  const closedDays = useMemo(() => 
    scheduleQuery.data?.filter((s) => !s.rangeSupervisionScheduled || s.rangeSupervision === 'closed')
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );

  const isSetDays = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervision === "confirmed" && s.rangeSupervisionScheduled)
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );

  const isPresent = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervision === "present" && s.rangeSupervisionScheduled)
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );

  const isOnTheWay = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervision === "en route" && s.rangeSupervisionScheduled)
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );


  const localeDayPicker = LOCALE[locale];
  // datepicker
  return (
    <DayPicker
      animate
      mode="multiple"
      selected={selectedDays}
      onSelect={setSelectedDays}
      month={month}
      onMonthChange={setMonth}
      locale={localeDayPicker}
      modifiers={{
        closed: closedDays,
        notSet: notSetDays,
        isSet: isSetDays,
        notConfirmedButSet: notConfirmedButSetDays,
        isPresent: isPresent,
        isOnTheWay: isOnTheWay,
      }}
      modifiersClassNames={{
        closed: 'bg-red-light rounded-full',
        notSet: 'bg-black-tint-05 rounded-full',
        isSet: 'bg-green-light rounded-full',
        isPresent: 'bg-green rounded-full',
        notConfirmedButSet: 'bg-turquoise rounded-full',
        isOnTheWay: 'bg-orange rounded-full',
        today: 'text-black font-extrabold underline font-size-2xl',
      }}
    />
  );
};

export default RaffleDatePicker;