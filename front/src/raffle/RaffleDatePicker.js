import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import translations from '../texts/texts.json';

const LANGUAGE = localStorage.getItem('language');

const WEEKDAYS_TEXT_LONG = translations.raffleDatePicker.weekdaysLong[LANGUAGE];
const WEEKDAYS_TEXT_SHORT = translations.raffleDatePicker.weekdaysShort[LANGUAGE];
const MONTHS_TEXT = translations.raffleDatePicker.months[LANGUAGE];

// const dateToString = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const RaffleDatePicker = ({ selectedDays, setSelectedDays }) => {
  const handleDayClick = (day, { selected }) => {
    if (selected) {
      const selectedIndex = selectedDays.findIndex((selectedDay) => DateUtils
        .isSameDay(selectedDay, day));
      setSelectedDays([...selectedDays.slice(0, selectedIndex),
        ...selectedDays.slice(selectedIndex + 1)]);
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <DayPicker
      // Set the calendar to start from current month
      fromMonth={new Date()}
      months={MONTHS_TEXT}
      weekdaysShort={WEEKDAYS_TEXT_SHORT}
      weekdaysLong={WEEKDAYS_TEXT_LONG}
      firstDayOfWeek={1}
      selectedDays={selectedDays}
      onDayClick={handleDayClick}
    />
  );
};

export default RaffleDatePicker;
