/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const endpoint = '/api/track-reservation';

jest.mock('../models/trackReservation');
const trackReservationModel = require('../models/trackReservation');

const privateEvent = {
  id: 1,
  track_section_id: 3,
  association_id: 12,
  association_name: 'Hirviseura',
  type: 'private_event',
  start_time: '11:00:00',
  end_time: '12:45:00',
  lanes_used: 20,
  description: null,
};

const authorityUse = {
  id: 2,
  track_section_id: 1,
  association_id: null,
  association_name: null,
  type: 'official',
  start_time: '14:00:00',
  end_time: '16:00:00',
  lanes_used: 20,
  description: null,
};

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    trackReservationModel.clear();
    trackReservationModel.seed([
      { ...privateEvent, date: '2026-11-14' },
      { ...authorityUse, date: '2026-11-14' },
      { ...privateEvent, id: 3, date: '2026-11-15' },
    ]);
  });

  describe('GET', () => {
    it('returns 200 and only the reservations on that date, without logging in', async () => {
      const res = await request.get(`${endpoint}?date=2026-11-14`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([privateEvent, authorityUse]);
    });

    it('filters by section as well', async () => {
      const res = await request.get(`${endpoint}?date=2026-11-14&track_section_id=1`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([authorityUse]);
    });

    it('returns 200 and an empty list for a day with no reservations', async () => {
      const res = await request.get(`${endpoint}?date=2026-11-16`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 400 without a date, rather than every reservation ever made', async () => {
      const res = await request.get(endpoint);

      expect(res.status).toBe(400);
    });

    it('returns 400 for a date that is not YYYY-MM-DD', async () => {
      for (const date of ['14.11.2026', '2026-11-31', '2026-11-14T10:00']) {
        const res = await request.get(`${endpoint}?date=${date}`);
        expect(res.status).toBe(400);
      }
    });
  });
});
