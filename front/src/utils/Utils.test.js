import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import * as utils from './Utils';
import testUtils from '../_TestUtils/TestUtils';

axios.get = jest.fn(() => Promise.resolve({ data: 'dummy axios response' }));

describe('testing weekview', () => {
  it('testing getSchedulingWeek', async () => {
    const { date } = testUtils;
    const result = await utils.getSchedulingWeek(date);
    expect(result.weekNum).toBe(43);
    expect(result.weekBegin).toBe('2020-10-19');
    expect(result.weekEnd).toBe('2020-10-25');
    expect(result.week).toBe('dummy axios response');
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

  it('testing validateLogin', async () => {
    localStorage.setItem('token', 'dummy_token');

    axios.get = jest.fn(() => Promise.resolve({ status: 200 }));
    const result = await utils.validateLogin();
    expect(result).toBe(true);

    axios.get = jest.fn(() => Promise.reject({ status: 401 }));
    const result2 = await utils.validateLogin();
    expect(result2).toBe(false);
  });

  it('testing updateRangeSupervision', async () => {
    axios.put = jest.fn(() => Promise.resolve({ ok: true }));
    const result = await utils.updateRangeSupervision(
      0,
      0,
      'open',
      true,
      'dummytoken',
    );
    expect(result).toBe(true);

    axios.put = jest.fn((url) => {
      if (url === '/api/reservation/0') return Promise.reject({ ok: false });
      return Promise.resolve({ ok: true });
    });
    const result2 = await utils.updateRangeSupervision(
      0,
      0,
      'open',
      true,
      'dummytoken',
    );
    expect(result2).toBe(
      'general range supervision failure: Error: scheduled reserv fail',
    );

    axios.put = jest.fn((url) => {
      if (url === 'api/range-supervision/0')
        return Promise.reject({ ok: false });
      return Promise.resolve({ ok: true });
    });
    const result3 = await utils.updateRangeSupervision(
      0,
      0,
      'open',
      true,
      'dummytoken',
    );
    expect(result3).toBe(
      'general range supervision failure: Error: scheduled superv fail',
    );
  });
});
