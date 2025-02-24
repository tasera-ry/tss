import userEvent from '@testing-library/user-event';
import axios from 'axios';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import SignIn from './SignIn';
import { TestProviders } from '../_TestUtils/TestProvides';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('testing SignIn component', () => {

  beforeAll(() => {
  })

  it('should render SignIn', async () => {
    render(<SignIn />, { wrapper: TestProviders });
    await waitFor(() =>
      expect(screen.getByText('Sign In')).toBeInTheDocument(),
    );
  });

  it('should give error on wrong credentials', async () => {
    await act(async () => {
      vi.mocked(axios.post).mockRejectedValue({ response: { status: 401 } });

      await render(<SignIn />, { wrapper: TestProviders });

      await waitFor(() => {
        expect(screen.getByTestId('nameField')).toBeInTheDocument()
        expect(screen.getByTestId('passwordField')).toBeInTheDocument()
      });
      await userEvent.type(screen.getByTestId('nameField'), 'wrong_username');
      await userEvent.type(screen.getByTestId('passwordField'), 'wrong_pw');
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
      vi.mocked(axios.post).mockResolvedValue({ data: 'dummy token' });

      await render(<SignIn />, { wrapper: TestProviders });

      await waitFor(() => {
        expect(screen.getByTestId('nameField')).toBeInTheDocument()
        expect(screen.getByTestId('passwordField')).toBeInTheDocument()
      });
      userEvent.type(screen.getByTestId('nameField'), 'correct_name');
      userEvent.type(screen.getByTestId('passwordField'), 'correct_pw');
      fireEvent.click(screen.getByText('Log in'));
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
    });
  });
});
