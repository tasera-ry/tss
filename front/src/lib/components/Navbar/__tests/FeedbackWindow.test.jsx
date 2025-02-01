import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import FeedbackWindow from '../FeedbackWindow';

axios.put = vi.fn(() => Promise.resolve());
localStorage.setItem('language', '1');

describe('testing FeedbackWindow', () => {
  it('should render FeedbackWindow', async () => {
    localStorage.setItem('language', '1');
    const dialogOpen = true;

    render(
      <FeedbackWindow
        user="dummyUser"
        dialogOpen={dialogOpen}
        onCloseDialog={() => {}}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText('Give feedback')).toBeInTheDocument(),
    );
  });
  it('should send feedback', async () => {
    localStorage.setItem('language', '1');
    const dialogOpen = true;

    render(
      <FeedbackWindow
        user="dummyUser"
        dialogOpen={dialogOpen}
        onCloseDialog={() => {}}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('feedback-field')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByTestId('feedback-field'), {
      target: {
        value: 'dummy feedback',
      },
    });
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });
});
