/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const endpoint = '/api/track-section';

jest.mock('../models/trackSection');
jest.mock('../models/track');
jest.mock('../models/user');
const trackSectionModel = require('../models/trackSection');
const trackModel = require('../models/track');
const userModel = require('../models/user');

// The shape of the #477 dev seed.
const sections = [
  { id: 1, track_id: 1, position: 1, lane_count: 20, name: 'Vasemmanpuoleisin', description: '20 paikan lohko' },
  { id: 2, track_id: 1, position: 2, lane_count: 20, name: 'Keskimmäinen', description: '20 paikan lohko' },
  { id: 3, track_id: 2, position: 1, lane_count: 40, name: 'Rata 2', description: 'Kivääri' },
];

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    trackSectionModel.clear();
    trackSectionModel.seed(sections);
  });

  describe('GET', () => {
    it('returns 200 and every section without logging in', async () => {
      const res = await request.get(endpoint);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(sections);
    });

    it('filters by track', async () => {
      const res = await request.get(`${endpoint}?track_id=1`);

      expect(res.status).toBe(200);
      expect(res.body.map(s => s.id)).toEqual([1, 2]);
    });

    it('returns 400 for a track id that is not an integer', async () => {
      const res = await request.get(`${endpoint}?track_id=rata1`);

      expect(res.status).toBe(400);
    });
  });
});

describe(`${endpoint} writes (#462)`, () => {
  const jwt = require('jsonwebtoken');
  const config = require('../config/config');
  const as = role => [`token=${jwt.sign({ id: role }, config.jwt.secret)}`];
  const admin = as('admin');
  const today = () =>
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' });

  beforeEach(async () => {
    jest.resetAllMocks();
    trackSectionModel.clear();
    trackSectionModel.seed(sections);
    trackModel.read.mockImplementation(async key =>
      [1, 2].includes(key['track.id']) ? [{ id: key['track.id'] }] : []);
    userModel.clear();
    await userModel.create({ id: 'admin', name: 'admin', role: 'superuser' });
    await userModel.create({ id: 'club', name: 'club', role: 'association' });
  });

  describe('POST', () => {
    it('adds a section after the track\'s last one', async () => {
      const res = await request.post(endpoint).set('Cookie', admin)
        .send({ track_id: 1, name: ' Oikeanpuoleisin ', lane_count: 20 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 4, track_id: 1, position: 3, lane_count: 20,
        name: 'Oikeanpuoleisin', description: '' });
    });

    it('refuses an unknown track, no lanes and an empty name', async () => {
      for (const body of [
        { track_id: 9, name: 'X', lane_count: 5 },
        { track_id: 1, name: 'X', lane_count: 0 },
        { track_id: 1, name: '  ', lane_count: 5 },
      ]) {
        expect((await request.post(endpoint).set('Cookie', admin).send(body)).status).toBe(400);
      }
      expect(await trackSectionModel.read({ track_id: 1 })).toHaveLength(2);
    });

    it('is for admins only', async () => {
      const res = await request.post(endpoint).set('Cookie', as('club'))
        .send({ track_id: 1, name: 'X', lane_count: 5 });
      expect(res.status).toBe(403);
    });
  });

  describe('PUT', () => {
    const put = (id, body, cookie = admin) =>
      request.put(`${endpoint}/${id}`).set('Cookie', cookie).send(body);

    it('changes the name, lanes and description', async () => {
      const res = await put(1, { name: 'Vasen', lane_count: 24, description: 'Uusi' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ id: 1, name: 'Vasen', lane_count: 24, description: 'Uusi' }));
    });

    it('refuses fewer lanes than bookings from today on need, listing the days', async () => {
      trackSectionModel.setPeaks(1, [
        { date: '2099-06-01', booked: 15 },
        { date: '2099-06-02', booked: 8 },
      ]);
      const res = await put(1, { lane_count: 10 });

      expect(res.status).toBe(409);
      expect(res.body).toEqual(expect.objectContaining({
        message: 'Bookings need more lanes',
        days: [{ date: '2099-06-01', booked: 15 }],
      }));
      expect(trackSectionModel.asked()).toEqual([{ id: 1, from: today() }]);
      expect((await trackSectionModel.read({ id: 1 }))[0].lane_count).toBe(20);
    });

    it('allows fewer lanes when the bookings still fit', async () => {
      trackSectionModel.setPeaks(1, [{ date: '2099-06-01', booked: 10 }]);
      expect((await put(1, { lane_count: 10 })).status).toBe(200);
    });

    it('answers 404 for a section that does not exist, and is for admins only', async () => {
      expect((await put(99, { name: 'X' })).status).toBe(404);
      expect((await put(1, { name: 'X' }, as('club'))).status).toBe(403);
    });
  });

  describe('DELETE', () => {
    const del = (id, cookie = admin) => request.delete(`${endpoint}/${id}`).set('Cookie', cookie);

    it('deletes a section that has no bookings from today on', async () => {
      expect((await del(2)).status).toBe(204);
      expect(await trackSectionModel.read({ track_id: 1 })).toHaveLength(1);
    });

    it('keeps a section with bookings from today on, listing the days', async () => {
      trackSectionModel.setPeaks(2, [{ date: '2099-06-01', booked: 5 }]);
      const res = await del(2);

      expect(res.status).toBe(409);
      expect(res.body.days).toEqual([{ date: '2099-06-01', booked: 5 }]);
    });

    it('keeps a track\'s last section', async () => {
      const res = await del(3);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('A track needs at least one section');
    });

    it('answers 404 for a section that does not exist, and is for admins only', async () => {
      expect((await del(99)).status).toBe(404);
      expect((await del(2, as('club'))).status).toBe(403);
    });
  });
});
