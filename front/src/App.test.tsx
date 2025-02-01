import '@testing-library/jest-dom';
import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { App } from './App';
import axios from 'axios';

vi.mock('./utils/Utils');
vi.mock('./infoBox/InfoBox', () => ({
  default: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

axios.get = vi.fn().mockResolvedValue({
  data: [{ id: 1, message: 'ok', start: '', end: '' }],
});

describe('testing App', () => {
  it('should render App', async () => {
    await act(async () => {
      render(
        <Router>
          <App/>
        </Router>,
      );
    });
    await waitFor(() =>
      expect(screen.getByText('Päävalvoja paikalla')).toBeInTheDocument(),
    );
  });
});
