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

  const scheduledDays = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervisionScheduled && s.rangeSupervision !== "confirmed")
    .map((day) => new Date(day.date)) || [], 
    [scheduleQuery.data]
  );
  const notScheduledDays = useMemo(() => scheduleQuery.data?.filter((s) => !s.rangeSupervisionScheduled).map((day) => new Date(day.date)) || [], [scheduleQuery.data]);
  const isConfirmedDays = useMemo(() => 
    scheduleQuery.data?.filter((s) => s.rangeSupervision === "confirmed")
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
      scheduled: scheduledDays,
      notScheduled: notScheduledDays,
      isConfirmed: isConfirmedDays,
    }}
    modifiersClassNames={{
      scheduled: 'bg-turquoise rounded-full',
      notScheduled: 'bg-red-500 rounded-full',
      isConfirmed: 'bg-green-500 rounded-full',
      today: 'text-black-500 font-bold ring-2 ring-black-500',
    }}
  />
  );
};

export default RaffleDatePicker;