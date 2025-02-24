import DayPicker, { DateUtils, ModifiersUtils } from "react-day-picker";
import "react-day-picker/lib/style.css";
import "./RaffleDatePicker.scss";
import { msg } from '@lingui/core/macro';
import { useLingui } from "@lingui/react";

const WEEKDAYS_TEXT_LONG = [
  msg`Sunday`,
  msg`Monday`,
  msg`Tuesday`,
  msg`Wednesday`,
  msg`Thursday`,
  msg`Friday`,
  msg`Saturday`,
];
const WEEKDAYS_TEXT_SHORT = [
  msg`Su`,
  msg`Mo`,
  msg`Tu`,
  msg`We`,
  msg`Th`,
  msg`Fr`,
  msg`Sa`,
];
const MONTHS_TEXT = [
  msg`January`,
  msg`February`,
  msg`March`,
  msg`April`,
  msg`May`,
  msg`June`,
  msg`July`,
  msg`August`,
  msg`September`,
  msg`October`,
  msg`November`,
  msg`December`,
];

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

  const { _ } = useLingui();

  const shortWeekdays = WEEKDAYS_TEXT_SHORT.map((day) => _(day))
  const longWeekdays = WEEKDAYS_TEXT_LONG.map((day) => _(day))
  const months = MONTHS_TEXT.map((month) => _(month))

  return (
    <DayPicker
      // Set the calendar to start from current month
      fromMonth={currentDate}
      showWeekNumbers
      disabledDays={disabledDays}
      months={months}
      weekdaysShort={shortWeekdays}
      weekdaysLong={longWeekdays}
      firstDayOfWeek={1}
      selectedDays={selectedDays}
      onDayClick={handleDayClick}
      onWeekClick={handleWeekClick}
    />
  );
};

export default RaffleDatePicker;
