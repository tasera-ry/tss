import { TestProviders } from '@/_TestUtils/TestProvides';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ResetPassword from './ResetPassword';

axios.get = vi.fn(() => Promise.resolve({ data: [{ role: 'association' }] }));
axios.post = vi.fn((url, credentials) => {
  if (credentials.email === '') {
    return Promise.reject({ response: { status: 400 } }); // eslint-disable-line
  }
  if (credentials.email === 'wrong_email') {
    return Promise.reject({ response: { status: 403 } }); // eslint-disable-line
  }
  return Promise.resolve({ data: 'dummy token' });
});

describe('testing ResetPassword component', () => {
  it('should render ResetPassword', async () => {
    localStorage.setItem('language', '1');
    render(<ResetPassword />, { wrapper: TestProviders });
    await waitFor(() =>
      expect(
        screen.getByText(
          'Input your e-mail address in order to reset your password',
        ),
      ).toBeInTheDocument(),
    );
  });

  it('should give error on empty field', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      await render(<ResetPassword />, { wrapper: TestProviders });

      await waitFor(() =>
        expect(screen.getByTestId('emailField')).toBeInTheDocument(),
      );
      userEvent.type(screen.getByTestId('emailField'), '');
      fireEvent.click(screen.getByText('Reset'));
      await waitFor(() =>
        expect(
          screen.getByText('E-mail address is required!'),
        ).toBeInTheDocument(),
      );
    });
  });

  it('should give error on wrong email address', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      await render(<ResetPassword />, { wrapper: TestProviders });

      await waitFor(() =>
        expect(screen.getByTestId('emailField')).toBeInTheDocument(),
      );
      userEvent.type(screen.getByTestId('emailField'), 'wrong_email');
      fireEvent.click(screen.getByText('Reset'));
      await setTimeout(
        () =>
          expect(
            screen.getByText('Invalid e-mail address!'),
          ).toBeInTheDocument(),
        5000,
      );
      // Timeout had to be added to have enough time for the message to render
    });
  });

  it('should send email with correct email address', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      await render(<ResetPassword />, { wrapper: TestProviders });

      await waitFor(() =>
        expect(screen.getByTestId('emailField')).toBeInTheDocument(),
      );
      userEvent.type(screen.getByTestId('emailField'), 'correct_email');
      fireEvent.click(screen.getByText('Reset'));
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
    });
  });
});
