import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaffleDatePicker from '../RaffleDatePicker';

describe('RaffleDatePicker', () => {
  it('renders the DayPicker component', () => {
    const mockSetSelectedDays = jest.fn();
    const mockSelectedDays = [new Date(2025, 3, 5)]; // Example selected date

    render(
      <RaffleDatePicker
        selectedDays={mockSelectedDays}
        setSelectedDays={mockSetSelectedDays}
      />
    );

    // Check if the DayPicker is rendered
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Check if the selected day is highlighted
    const selectedDay = screen.getByText('5'); // Day 5 of the month
    expect(selectedDay).toHaveClass('bg-green-light'); // Modifier class for selected days
  });

  it('calls setSelectedDays when a day is clicked', async () => {
    const mockSetSelectedDays = jest.fn();
    const mockSelectedDays = [];

    render(
      <RaffleDatePicker
        selectedDays={mockSelectedDays}
        setSelectedDays={mockSetSelectedDays}
      />
    );

    // Simulate clicking on a day
    const dayToSelect = screen.getByText('10'); // Example day
    await userEvent.click(dayToSelect);

    // Ensure setSelectedDays is called
    expect(mockSetSelectedDays).toHaveBeenCalled();
  });
});