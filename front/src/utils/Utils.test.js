import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import * as utils from './Utils';
import testUtils from '../_TestUtils/TestUtils';

axios.get = jest.fn(() => Promise.resolve({ data: 'dummy axios response' }));
global.fetch = jest.fn(() => (Promise.resolve({ json: () => Promise.resolve('dummy fetch response') })));

describe('testing weekview', () => {
  it('testing getSchedulingDate', async () => {
    const { date } = testUtils;
    const result = await utils.getSchedulingDate(date);
    expect(result).toBe('dummy fetch response');
  });

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

    global.fetch = jest.fn(() => (Promise.resolve({ status: 200 })));
    const result = await utils.validateLogin();
    expect(result).toBe(true);

    global.fetch = jest.fn(() => (Promise.resolve({ status: 401 })));
    const result2 = await utils.validateLogin();
    expect(result2).toBe(false);
  });

  it('testing rangeSupervision', async () => {
    global.fetch = jest.fn(() => (Promise.resolve({ ok: true })));
    const result = await utils.rangeSupervision(0, 0, 'open', true, 'dummytoken');
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      '/api/reservation/0', {
        body: '{"available":true}',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        method: 'PUT',
      },
    );
    expect(fetch).toHaveBeenCalledWith(
      '/api/range-supervision/0', {
        body: '{"range_supervisor":"open","supervisor":"dummytoken"}',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        method: 'PUT',
      },
    );

    global.fetch = jest.fn((url) => {
      if (url === '/api/reservation/0') {
        return (Promise.resolve({ ok: false }));
      }
      return (Promise.resolve({ ok: true }));
    });
    const result2 = await utils.rangeSupervision(0, 0, 'open', true, 'dummytoken');
    expect(result2).toBe('general range supervision failure: Error: scheduled reserv fail');

    global.fetch = jest.fn((url) => {
      if (url === '/api/range-supervision/0') {
        return (Promise.resolve({ ok: false }));
      }
      return (Promise.resolve({ ok: true }));
    });
    const result3 = await utils.rangeSupervision(0, 0, 'open', true, 'dummytoken');
    expect(result3).toBe('general range supervision failure: Error: scheduled superv fail');
  });
});
