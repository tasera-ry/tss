import { TestProviders } from '@/_TestUtils/TestProvides';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { HashRouter as Router } from 'react-router-dom';
import { DialogWindow } from './LoggedIn';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));
axios.get.mockResolvedValue({
  data: [],
});

describe('testing LoggedIn', () => {
  it('should render LoggedIn', async () => {
    localStorage.setItem('language', '1');
    act(() => {
      render(
        <Router>
          <DialogWindow />
        </Router>,
        { wrapper: TestProviders },
      );
    });
    await waitFor(() =>
      expect(screen.getByText('Confirm supervisions')).toBeInTheDocument(),
    );
  });
});
