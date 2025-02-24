import { waitFor, render, screen } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { SupervisorNotification } from '../SupervisorNotification';
import * as checkSuper from '../../../../upcomingsupervisions/LoggedIn';
import { TestProviders } from '@/_TestUtils/TestProvides';

vi.mock(import('../../../../upcomingsupervisions/LoggedIn'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    checkSuper: vi.fn(),
  }
})

describe('testing SupervisorNotification', () => {
  it('should render SupervisorNotification', async () => {
    checkSuper.checkSupervisorReservations = vi.fn(() => true);
    localStorage.setItem('language', '1');

    await act(async () => {
      render(
        <Router>
          <SupervisorNotification />
        </Router>,
        { wrapper: TestProviders }
      );
    });
    await waitFor(() =>
      expect(
        screen.getByText('You have unconfirmed range officer reservations!'),
      ).toBeInTheDocument(),
    );
  });
});
