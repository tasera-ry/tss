import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import OfficerForm from '../profilepages/officerform';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock the api response
axios.post.mockResolvedValue();

describe('OfficerForm', () => {
  it('renders form inputs correctly', async() => {

    render(<OfficerForm id={1} />);

    await waitFor(() => expect(screen.getByTestId('username')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('password')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('passwordConfirm')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('submit-button')).toBeInTheDocument());
  });

  test('displays error notification when form is submitted with empty fields', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      render(<OfficerForm id={1} />);

      await waitFor(() =>
        expect(screen.getByTestId('username')).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() =>
        expect(screen.getByTestId('alert')).toHaveClass(
          'MuiAlert-standardError',
        ),
      );
    });
  });

  test('displays error notification when passwords do not match', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      render(<OfficerForm id={1} />);

      await waitFor(() =>
        expect(screen.getByTestId('username')).toBeInTheDocument(),
      );

      userEvent.type(screen.getByTestId('username'), 'testuser');
      userEvent.type(screen.getByTestId('password'), 'password1');
      userEvent.type(screen.getByTestId('passwordConfirm'), 'password2');
      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() =>
        expect(screen.getByTestId('alert')).toHaveClass(
          'MuiAlert-standardError',
        ),
      );
    });
  });

  test('successfully creates a new user when form is submitted with correct fields', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');

      render(<OfficerForm id={1} />);

      await waitFor(() =>
        expect(screen.getByTestId('username')).toBeInTheDocument(),
      );

      userEvent.type(screen.getByTestId('username'), 'TestOfficer123');
      userEvent.type(screen.getByTestId('password'), 'Password123');
      userEvent.type(screen.getByTestId('passwordConfirm'), 'Password123');
      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() =>
        expect(axios.post).toHaveBeenCalledWith('/api/user', {
          name: 'TestOfficer123',
          role: 'rangeofficer',
          password: 'Password123',
          associationId: 1,
        }),
      );
    });
  });
});
