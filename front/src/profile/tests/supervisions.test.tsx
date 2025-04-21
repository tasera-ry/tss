import { TestProviders } from '@/_TestUtils/TestProvides';
import api from '@/api/api';
import { render, screen, waitFor } from '@testing-library/react';
import { useCookies } from 'react-cookie';
import Supervisions from '../profilepages/supervisions';

vi.mock('react-cookie', async (originalModule) => {
  const originalImport = (await originalModule()) as any;
  return {
    ...originalImport,
    useCookies: vi.fn(),
  };
});
vi.mock('@/api/api');

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

const associationMock = [{ association_id: 1 }];

describe('Supervisions component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getSupervisions).mockResolvedValueOnce(supervisionsMock);
    vi.mocked(api.getRangeOfficers).mockResolvedValueOnce(rangeofficerListMock);
    vi.mocked(api.getAssociation).mockResolvedValueOnce(associationMock);
  });

  test('renders the table correctly', async () => {
    vi.mocked(useCookies).mockReturnValue([
      { role: 'association', id: 1 },
      vi.fn(),
      vi.fn(),
    ]);

    render(<Supervisions />, {
      wrapper: TestProviders,
    });
    await waitFor(() => {
      expect(screen.getByTestId('supervisions-table')).toBeInTheDocument();
    });
  });

  test('fetches and displays data for association user correctly', async () => {
    vi.mocked(useCookies).mockReturnValue([
      { role: 'association', id: 1 },
      vi.fn(),
      vi.fn(),
    ]);

    render(<Supervisions />, {
      wrapper: TestProviders,
    });

    // Wait for the API calls to be resolved
    await waitFor(() => {
      expect(api.getRangeOfficers).toHaveBeenCalledTimes(1);
      expect(api.getSupervisions).toHaveBeenCalledTimes(1);
    });

    // Check that the number of status cells matches the number of supervisions
    const rows = screen.getAllByTestId('supervisions-row');
    expect(rows.length).toBe(supervisionsMock.length);

    // Verify that the state is updated correctly
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('2/2/2024')).toBeInTheDocument();
    expect(screen.getByText('3/3/2024')).toBeInTheDocument();

    // Check that the status is rendered
    expect(screen.getByTestId('status-cell-1')).toHaveValue('not confirmed');
    expect(screen.getByTestId('status-cell-2')).toHaveValue('confirmed');
    expect(screen.getByTestId('status-cell-3')).toHaveValue('confirmed');

    // Check that rangeofficers are rendered for the association
    const officers = screen.getAllByTestId('officer-cell');
    expect(officers.length).toBe(rangeofficerListMock.length);
  });

  test('fetches and displays data for rangeofficer user correctly', async () => {
    vi.mocked(useCookies).mockReturnValue([
      { role: 'rangeofficer', id: 5 },
      vi.fn(),
      vi.fn(),
    ]);

    render(<Supervisions />, {
      wrapper: TestProviders,
    });

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
    const officerCells = table.querySelectorAll('[data-testid="officer-cell"]');
    expect(officerCells.length).toBe(0);
  });
});
