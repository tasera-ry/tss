import DayPicker, { DateUtils, ModifiersUtils } from "react-day-picker";
import "react-day-picker/lib/style.css";
import "./RaffleDatePicker.scss";
import { msg } from '@lingui/core/macro';
import { useLingui } from "@lingui/react";
import { useQuery } from 'react-query';
import { Tooltip } from 'react-tooltip';

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

  const fetchRaffleData = async (month) => {
    const response = await fetch(`/api/raffle?month=${month}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  const RaffleDatePicker = ({ selectedDays, setSelectedDays }) => {
    const currentDate = new Date();
    const [hoveredDay, setHoveredDay] = useState(null);

    const { data: raffleData, status } = useQuery(
      ['raffleData', currentDate.getMonth()],
      () => fetchRaffleData(currentDate.getMonth())
    );

    const isRaffled = (day) => {
      return raffleData?.some((raffle) => DateUtils.isSameDay(new Date(raffle.date), day));
    };

    const getRaffledTo = (day) => {
      const raffle = raffleData?.find((raffle) => DateUtils.isSameDay(new Date(raffle.date), day));
      return raffle ? raffle.raffledTo : null;
    };

    const handleDayMouseEnter = (day) => {
      setHoveredDay(day);
    };

    const handleDayMouseLeave = () => {
      setHoveredDay(null);
    };

    return (
      <>
      <DayPicker
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
        modifiers={{
        raffled: (day) => isRaffled(day),
        closed: (day) => !isRaffled(day) && DateUtils.isPastDay(day),
        }}
        modifiersStyles={{
        raffled: {
          backgroundColor: 'lightgreen',
        },
        closed: {
          backgroundColor: 'red',
        },
        }}
        onDayMouseEnter={handleDayMouseEnter}
        onDayMouseLeave={handleDayMouseLeave}
      />
      {hoveredDay && isRaffled(hoveredDay) && (
        <Tooltip
        isOpen={true}
        target={hoveredDay}
        placement="top"
        >
        Raffled to: {getRaffledTo(hoveredDay)}
        </Tooltip>
      )}
      {hoveredDay && !isRaffled(hoveredDay) && DateUtils.isPastDay(hoveredDay) && (
        <Tooltip
          isOpen={true}
          target={hoveredDay}
          placement="top"
        >
          Closed
        </Tooltip>
      )}
      </>
    );
    };
  };

export default RaffleDatePicker;
