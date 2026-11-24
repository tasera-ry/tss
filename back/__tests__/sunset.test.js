/* eslint-env jest */
jest.mock('suncalc', () => ({
  getTimes: jest.fn(),
}));

const SunCalc = require('suncalc');
const getSunset = require('../services/sunset');

describe('getSunset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates sunset for the configured location and returns Helsinki time', () => {
    SunCalc.getTimes.mockReturnValue({
      sunset: new Date('2026-10-28T14:34:43.095Z'),
    });

    expect(getSunset('2026-10-28')).toBe('16:34:43');
    expect(SunCalc.getTimes).toHaveBeenCalledWith(
      new Date('2026-10-28T12:00:00Z'),
      61.403452453132466,
      23.64142961367598,
    );
  });

  it('uses the correct Helsinki daylight-saving offset for the requested date', () => {
    SunCalc.getTimes.mockReturnValue({
      sunset: new Date('2026-03-29T17:03:29.999Z'),
    });

    expect(getSunset('2026-03-29')).toBe('20:03:29');
  });

  it('returns null when the sun does not set', () => {
    SunCalc.getTimes.mockReturnValue({ sunset: new Date(Number.NaN) });

    expect(getSunset('2026-10-28')).toBeNull();
  });

  it('rejects dates that are not valid YYYY-MM-DD calendar dates', () => {
    expect(() => getSunset('2026-02-30')).toThrow(
      'Expected date in YYYY-MM-DD format',
    );
    expect(SunCalc.getTimes).not.toHaveBeenCalled();
  });
});
