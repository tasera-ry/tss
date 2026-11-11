/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const endpoint = '/api/track-section';

jest.mock('../models/trackSection');
const trackSectionModel = require('../models/trackSection');

const sections = [
  { id: 1, track_id: 1, name: 'Lohko 1', position: 'Vasemmanpuoleisin loossi', lane_count: 20 },
  { id: 2, track_id: 1, name: 'Lohko 2', position: 'Keskimmäinen loossi', lane_count: 20 },
  { id: 3, track_id: 2, name: '', position: null, lane_count: 40 },
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
