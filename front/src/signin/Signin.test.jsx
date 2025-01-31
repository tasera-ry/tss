import userEvent from '@testing-library/user-event';
import * as axios from 'axios';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import SignIn from './SignIn';

vi.mock('axios', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));
axios.get = vi.fn(() => Promise.resolve({ data: [{ role: 'association' }] }));
axios.post = vi.fn((url, credentials) => {
  if (credentials.name === 'wrong_username') {
    return Promise.reject({ response: { status: 401 } }); // eslint-disable-line
  }
  return Promise.resolve({ data: 'dummy token' });
});

describe('testing SignIn component', () => {
  it('should render SignIn', async () => {
    localStorage.setItem('language', '1');
    render(<SignIn />);
    await waitFor(() =>
      expect(screen.getByText('Sign In')).toBeInTheDocument(),
    );
  });

  it('should give error on wrong credentials', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      await render(<SignIn />);

      await waitFor(() =>
        expect(screen.getByTestId('nameField')).toBeInTheDocument(),
      );
      userEvent.type(screen.getByTestId('nameField'), 'wrong_username');
      userEvent.type(screen.getByTestId('passwordField'), 'wrong_pw');
      fireEvent.click(screen.getByText('Log in'));
      await waitFor(() =>
        expect(
          screen.getByText('Wrong username or password'),
        ).toBeInTheDocument(),
      );
    });
  });
  it('should access with correct credentials', async () => {
    await act(async () => {
      localStorage.setItem('language', '1');
      await render(<SignIn />);

      await waitFor(() =>
        expect(screen.getByTestId('nameField')).toBeInTheDocument(),
      );
      userEvent.type(screen.getByTestId('nameField'), 'correct_name');
      userEvent.type(screen.getByTestId('passwordField'), 'correct_pw');
      fireEvent.click(screen.getByText('Log in'));
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
    });
  });
});
