import React from "react";
import DayPicker, { DateUtils, ModifiersUtils } from "react-day-picker";
import "react-day-picker/lib/style.css";
import "./RaffleDatePicker.scss";
import translations from "../texts/texts.json";

const LANGUAGE = localStorage.getItem("language");

const WEEKDAYS_TEXT_LONG = translations.raffleDatePicker.weekdaysLong[LANGUAGE];
const WEEKDAYS_TEXT_SHORT =
  translations.raffleDatePicker.weekdaysShort[LANGUAGE];
const MONTHS_TEXT = translations.raffleDatePicker.months[LANGUAGE];

const RaffleDatePicker = ({ selectedDays, setSelectedDays }) => {
  const currentDate = new Date();
  // sundays and past or current days are not allowed in raffle
  const disabledDays = [
    { daysOfWeek: [0] },
    { before: currentDate },
    currentDate,
  ];

  const getSelectedIndex = (day, array) =>
    array.findIndex((selectedDay) => DateUtils.isSameDay(selectedDay, day));

  const handleDayClick = (day, { selected, disabled }) => {
    if (disabled) return;
    if (selected) {
      const selectedIndex = getSelectedIndex(day, selectedDays);
      setSelectedDays([
        ...selectedDays.slice(0, selectedIndex),
        ...selectedDays.slice(selectedIndex + 1),
      ]);
    } else setSelectedDays([...selectedDays, day]);
  };

  // Selects week's non-disabled days. If all days are selected, unselect them instead
  const handleWeekClick = (_, allWeekDays) => {
    // filter out disabled days
    const days = allWeekDays.filter(
      (day) => !ModifiersUtils.dayMatchesModifier(day, disabledDays)
    );
    // filter out not selected days
    const newDays = days.filter(
      (day) => !ModifiersUtils.dayMatchesModifier(day, selectedDays)
    );
    if (newDays.length > 0) setSelectedDays([...selectedDays, ...newDays]);
    else {
      // unselect week's days
      let newSelectedDays = [...selectedDays];

      days.forEach((day) => {
        const index = getSelectedIndex(day, newSelectedDays);
        newSelectedDays = [
          ...newSelectedDays.slice(0, index),
          ...newSelectedDays.slice(index + 1),
        ];
      });

      setSelectedDays(newSelectedDays);
    }
  };

  return (
    <DayPicker
      // Set the calendar to start from current month
      fromMonth={currentDate}
      showWeekNumbers
      disabledDays={disabledDays}
      months={MONTHS_TEXT}
      weekdaysShort={WEEKDAYS_TEXT_SHORT}
      weekdaysLong={WEEKDAYS_TEXT_LONG}
      firstDayOfWeek={1}
      selectedDays={selectedDays}
      onDayClick={handleDayClick}
      onWeekClick={handleWeekClick}
    />
  );
};

export default RaffleDatePicker;
