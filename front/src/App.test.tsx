import { TestProviders } from '@/_TestUtils/TestProvides';
import { schedulingWeek } from '@/_TestUtils/TestUtils';
import { getSchedulingWeek, validateLogin } from '@/utils/Utils';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { App } from './App';

vi.mock('@/lib/components/InfoBox', () => ({
  InfoBox: () => <div data-testid="mockInfoBox">Mock InfoBox</div>,
}));

vi.mock(import('@/utils/Utils'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getSchedulingWeek: vi.fn(),
    validateLogin: vi.fn(),
  };
});

vi.mock('@/api/api', () => ({
  default: {
    getPublicInfoMessages: vi.fn(),
    getRangeMasterInfoMessages: vi
      .fn()
      .mockResolvedValue([{ id: 1, message: 'test message' }]),
  },
}));

describe('testing App', () => {
  it('should render App', async () => {
    vi.mocked(getSchedulingWeek).mockResolvedValue(schedulingWeek as any);
    vi.mocked(validateLogin).mockResolvedValue(true);

    await act(async () => {
      render(<App />, { wrapper: TestProviders });
    });
  });
});
