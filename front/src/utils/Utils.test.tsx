import '@testing-library/jest-dom';
import * as utils from './Utils';
import testUtils from '../_TestUtils/TestUtils';
import api from '../api/api'; 
import { validateLogin, updateRangeSupervision } from './Utils'; // Import validateLogin
import { AxiosResponse } from 'axios';

vi.mock('../api/api');

describe('testing weekview', () => {
  it('testing getSchedulingWeek', async () => {
    const mockResponse = 'dummy axios response';
    vi.mocked(api.getSchedulingWeek).mockResolvedValue(mockResponse);

    const { date } = testUtils;
    const result = await utils.getSchedulingWeek(date);
    
    expect(result.weekNum).toBe(43);
    expect(result.weekBegin).toBe('2020-10-19');
    expect(result.weekEnd).toBe('2020-10-25');
    expect(result.week).toBe(mockResponse);
  });

  it('testing dayToString', async () => {
    localStorage.setItem('language', '1');
    const result = await utils.dayToString(1);
    expect(result).toBe('Monday');

    localStorage.setItem('language', '0');
    const result2 = await utils.dayToString(1);
    expect(result2).toBe('Maanantai');
  });

  it('testing monthToString', async () => {
    localStorage.setItem('language', '1');
    const result = await utils.monthToString(0);
    expect(result).toBe('January');

    localStorage.setItem('language', '0');
    const result2 = await utils.monthToString(0);
    expect(result2).toBe('tammikuu');
  });

  it('should return true when the login token is valid', async () => {
    vi.mocked(api.validateLogin).mockResolvedValue({} as AxiosResponse);

    const result = await validateLogin();
    expect(result).toBe(true);
  });

  it('should return false when the login token is invalid', async () => {
    vi.mocked(api.validateLogin).mockRejectedValue(new Error('Invalid token'));

    const result = await validateLogin();
    expect(result).toBe(false);
  });

  const failureText = 'general range supervision failure: Error: ';

  it('should return failure text if rsId or srsId is null', async () => {
    const result = await updateRangeSupervision(null, 1, 'open', true, 'assoc');
    expect(result).toBe(failureText + 'reservation or schedule missing');

    const result2 = await updateRangeSupervision(1, null, 'open', true, 'assoc');
    expect(result2).toBe(failureText + 'reservation or schedule missing');
  });

  it('should handle closed range status', async () => {
    vi.mocked(api.patchReservation).mockResolvedValue({} as AxiosResponse);

    const result = await updateRangeSupervision(1, 1, 'closed', true, 'assoc');
    expect(result).toBe(true);

    vi.mocked(api.patchReservation).mockRejectedValue(new Error('API error'));
    const result2 = await updateRangeSupervision(1, 1, 'closed', true, 'assoc');
    expect(result2).toBe(failureText + 'reservation update failed');
  });

  it('should handle adding new supervision when not scheduled', async () => {
    vi.mocked(api.patchReservation).mockResolvedValue({} as AxiosResponse);
    vi.mocked(api.addRangeSupervision).mockResolvedValue();

    const result = await updateRangeSupervision(1, 1, 'open', false, 'assoc');
    expect(result).toBe(true);

    vi.mocked(api.patchReservation).mockRejectedValue(new Error('API error'));
    const result2 = await updateRangeSupervision(1, 1, 'open', false, 'assoc');
    expect(result2).toBe(failureText + 'not scheduled reserv fail');

    vi.mocked(api.patchReservation).mockResolvedValue({} as AxiosResponse);
    vi.mocked(api.addRangeSupervision).mockRejectedValue(new Error('API error'));
    const result3 = await updateRangeSupervision(1, 1, 'open', false, 'assoc');
    expect(result3).toBe(failureText + 'not scheduled superv fail');
  });

  it('should handle updating existing supervision', async () => {
    vi.mocked(api.patchReservation).mockResolvedValue({} as AxiosResponse);
    vi.mocked(api.patchRangeSupervision).mockResolvedValue({} as AxiosResponse);

    const result = await updateRangeSupervision(1, 1, 'open', true, 'assoc');
    expect(result).toBe(true);

    vi.mocked(api.patchReservation).mockRejectedValue(new Error('API error'));
    const result2 = await updateRangeSupervision(1, 1, 'open', true, 'assoc');
    expect(result2).toBe(failureText + 'scheduled reserv fail');

    vi.mocked(api.patchReservation).mockResolvedValue({} as AxiosResponse);
    vi.mocked(api.patchRangeSupervision).mockRejectedValue(new Error('API error'));
    const result3 = await updateRangeSupervision(1, 1, 'open', true, 'assoc');
    expect(result3).toBe(failureText + 'scheduled superv fail');
  });
});
