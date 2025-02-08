import { render, screen, act, waitFor } from '@testing-library/react';
import Supervisions from '../profilepages/supervisions';
import api from '../../api/api';

// Mock data for the tests
const supervisionsMock = [
  {
    id: 1,
    date: '2024-01-01',
    range_supervisor: 'not confirmed',
    rangeofficer_id: null,
    arriving_at: null,
  },
  {
    id: 2,
    date: '2024-02-02',
    range_supervisor: 'confirmed',
    rangeofficer_id: 5,
    arriving_at: null,
  },
  {
    id: 3,
    date: '2024-03-03',
    range_supervisor: 'confirmed',
    rangeofficer_id: 1,
    arriving_at: null,
  },
];

const rangeofficerListMock = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'James Smith' },
  { id: 5, name: 'Jane Smith' },
];

describe('Supervisions component', () => {
  beforeEach(() => {
    // Mock api calls before each test to set the state
    vi.clearAllMocks();

    api.getRangeOfficers = vi.fn();
    api.getSupervisions = vi.fn();
    api.getAssociation = vi.fn();
    api.putSupervision = vi.fn();
  });

  test('renders the table correctly', async () => {
    await act(async () => {
      api.getSupervisions.mockResolvedValueOnce(supervisionsMock);
      api.getRangeOfficers.mockResolvedValueOnce(rangeofficerListMock);

      render(<Supervisions cookies={{ role: 'association', id: 1 }} />);
      expect(screen.getByTestId('supervisions-table')).toBeInTheDocument();
    });
  });

  test('fetches and displays data for association user correctly', async () => {
    await act(async () => {
      api.getSupervisions.mockResolvedValueOnce(supervisionsMock);
      api.getRangeOfficers.mockResolvedValueOnce(rangeofficerListMock);

      render(<Supervisions cookies={{ role: 'association', id: 1 }} />);

      // Wait for the API calls to be resolved
      await waitFor(() => {
        expect(api.getRangeOfficers).toHaveBeenCalledTimes(1);
        expect(api.getSupervisions).toHaveBeenCalledTimes(1);
      });

      // Check that the number of status cells matches the number of supervisions
      const rows = screen.getAllByTestId('supervisions-row');
      expect(rows.length).toBe(supervisionsMock.length);

      // Verify that the state is updated correctly
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('2024-02-02')).toBeInTheDocument();
      expect(screen.getByText('2024-03-03')).toBeInTheDocument();
      expect(screen.getByText('not confirmed')).toBeInTheDocument();

      // Check that the confirmed status is rendered twice
      const confirmedElements = screen.getAllByText('confirmed');
      expect(confirmedElements.length).toBe(2);

      // Check that rangeofficers are rendered for the association
      const officers = screen.getAllByTestId('officer-cell');
      expect(officers.length).toBe(rangeofficerListMock.length);
    });
  });

  test('fetches and displays data for rangeofficer user correctly', async () => {
    await act(async () => {
      api.getSupervisions.mockResolvedValueOnce(supervisionsMock);
      api.getAssociation.mockResolvedValueOnce([{ association_id: 1 }]);

      render(<Supervisions cookies={{ role: 'rangeofficer', id: 5 }} />);

      // Check that getRangeofficers endpoint is not called
      await waitFor(() => {
        expect(api.getAssociation).toHaveBeenCalledTimes(1);
        expect(api.getSupervisions).toHaveBeenCalledTimes(1);
        expect(api.getRangeOfficers).toHaveBeenCalledTimes(0);
      });

      // Check that rangeofficer gets their picked and/or available supervisions
      // In this case one offcier has picked a shift -> only 2 supervisions are rendered
      const rows = screen.getAllByTestId('supervisions-row');
      expect(rows.length).toBe(2);

      // Check that the officer selection menu is not rendered for the rangeofficer user
      const table = screen.getByTestId('supervisions-table');
      const officerCells = table.querySelectorAll(
        '[data-testid="officer-cell"]',
      );
      expect(officerCells.length).toBe(0);
    });
  });
});
