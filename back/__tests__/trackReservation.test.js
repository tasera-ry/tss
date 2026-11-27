/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const endpoint = '/api/track-reservation';

jest.mock('../models/trackReservation');
jest.mock('../models/trackSection');
jest.mock('../models/user');
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

describe(`${endpoint} writes`, () => {
  const _ = require('lodash');
  const jwt = require('jsonwebtoken');
  const config = require('../config/config');

  const userModel = require('../models/user');
  const trackSectionModel = require('../models/trackSection');

  const FUTURE = '2099-06-01';
  const PAST = '2000-01-01';

  // Track 1 has three 20-lane sections; track 2 one of 40.
  const sections = [
    { id: 1, track_id: 1, position: 1, lane_count: 20, name: 'Vasemmanpuoleisin', description: null },
    { id: 2, track_id: 1, position: 2, lane_count: 20, name: 'Keskimmäinen', description: null },
    { id: 3, track_id: 1, position: 3, lane_count: 20, name: 'Oikeanpuoleisin', description: null },
    { id: 4, track_id: 2, position: 1, lane_count: 40, name: 'Rata 2', description: null },
  ];

  const as = role => [`token=${jwt.sign({ id: role }, config.jwt.secret)}`];
  const admin = as('admin');

  const privateEvent = {
    date: FUTURE,
    start_time: '12:00',
    end_time: '14:00',
    type: 'private_event',
    track_section_id: 1,
    lanes_used: 10,
    association_id: 12,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    userModel.clear();
    await userModel.create({ id: 'admin', name: 'admin', role: 'superuser' });
    await userModel.create({ id: 'club', name: 'club', role: 'association' });
    await userModel.create({ id: 'tablet', name: 'tablet', role: 'rangemaster' });
    await userModel.create({ id: 12, name: 'Hirviseura', role: 'association' });
    await userModel.create({ id: 13, name: 'Toinen pääkäyttäjä', role: 'superuser' });
    trackSectionModel.clear();
    trackSectionModel.seed(sections);
    trackReservationModel.clear();
  });

  describe('POST', () => {
    it('creates a private event for a superuser', async () => {
      const res = await request.post(endpoint).set('Cookie', admin).send(privateEvent);

      expect(res.status).toBe(201);
      expect(res.body).toEqual([
        expect.objectContaining({
          track_section_id: 1,
          lanes_used: 10,
          association_id: 12,
          start_time: '12:00:00',
          end_time: '14:00:00',
        }),
      ]);
    });

    it.each([['club'], ['tablet']])('refuses the %s account: only admins edit schedules', async (who) => {
      const res = await request.post(endpoint).set('Cookie', as(who)).send(privateEvent);

      expect(res.status).toBe(403);
    });

    it('refuses without logging in', async () => {
      const res = await request.post(endpoint).send(privateEvent);

      // The shared jwt middleware answers a missing token with 500, not 401
      // (middlewares/jwt.js); what matters here is that nothing is stored.
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(await trackReservationModel.readRows({})).toEqual([]);
    });

    it('books official use on every section of the track, with every lane and no association', async () => {
      const res = await request.post(endpoint).set('Cookie', admin).send({
        date: FUTURE,
        start_time: '15:00',
        end_time: '17:30',
        type: 'official',
        track_section_id: 2,
      });

      expect(res.status).toBe(201);
      expect(res.body.map(r => [r.track_section_id, r.lanes_used, r.association_id])).toEqual([
        [1, 20, null],
        [2, 20, null],
        [3, 20, null],
      ]);
    });

    it('refuses a past day: past days are read-only', async () => {
      const res = await request.post(endpoint).set('Cookie', admin).send({ ...privateEvent, date: PAST });

      expect(res.status).toBe(400);
    });

    it('refuses a reservation that ends before it starts', async () => {
      const res = await request.post(endpoint).set('Cookie', admin).send({
        ...privateEvent,
        start_time: '14:00',
        end_time: '12:00',
      });

      expect(res.status).toBe(400);
    });

    it('asks for lanes, except for official use', async () => {
      const withoutLanes = _.omit(privateEvent, 'lanes_used');
      const res = await request.post(endpoint).set('Cookie', admin).send(withoutLanes);

      expect(res.status).toBe(400);
    });

    const laneConflict = (used, total) => {
      const error = new Error(
        'Reservation of 10 lane(s) on section 1 on 2099-06-01 overlaps ' +
          `reservations already using ${used} of the section's ${total} lane(s)`,
      );
      error.code = 'P0001';
      return error;
    };

    it('refuses more lanes than the section has, through the database trigger', async () => {
      trackReservationModel.failNextWrite(laneConflict(0, 20));

      const res = await request.post(endpoint).set('Cookie', admin).send({ ...privateEvent, lanes_used: 25 });

      expect(res.status).toBe(409);
      expect(res.body.free).toBe(20);
    });

    it('says the track is not free when official use conflicts, without a lane count', async () => {
      trackReservationModel.failNextWrite(laneConflict(5, 20));

      const res = await request.post(endpoint).set('Cookie', admin).send({
        date: FUTURE, start_time: '15:00', end_time: '17:00', type: 'official', track_section_id: 1,
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('The track is not free for official use');
      expect(res.body.free).toBeUndefined();
    });

    it('refuses a holder that is not a member association', async () => {
      const res = await request.post(endpoint).set('Cookie', admin).send({ ...privateEvent, association_id: 13 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Unknown association');
    });

    it('refuses ids beyond what the database can store, instead of a 500', async () => {
      const res = await request.post(endpoint).set('Cookie', admin).send({ ...privateEvent, track_section_id: 9999999999 });

      expect(res.status).toBe(400);
    });

    it('answers a lane conflict from the database with 409 and the lanes still free', async () => {
      const conflict = new Error(
        'Reservation of 10 lane(s) on section 1 on 2099-06-01 overlaps ' +
          'reservations already using 15 of the section\'s 20 lane(s)',
      );
      conflict.code = 'P0001';
      trackReservationModel.failNextWrite(conflict);

      const res = await request.post(endpoint).set('Cookie', admin).send(privateEvent);

      expect(res.status).toBe(409);
      expect(res.body).toEqual(expect.objectContaining({
        message: 'Not enough free lanes',
        free: 5,
        total: 20,
        track_section_id: 1,
        date: '2099-06-01',
      }));
    });
  });

  describe('PUT', () => {
    it('changes a private event', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent, start_time: '12:00:00', end_time: '14:00:00' }]);

      const res = await request.put(`${endpoint}/7`).set('Cookie', admin).send({ end_time: '15:00', lanes_used: 12 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([expect.objectContaining({ id: 7, end_time: '15:00:00', lanes_used: 12 })]);
    });

    it('moves the whole official booking, every section together', async () => {
      const official = { date: FUTURE, start_time: '15:00:00', end_time: '17:00:00', type: 'official', association_id: null, lanes_used: 20 };
      trackReservationModel.seed([
        { id: 1, ...official, track_section_id: 1 },
        { id: 2, ...official, track_section_id: 2 },
        { id: 3, ...official, track_section_id: 3 },
        { id: 4, ...official, track_section_id: 4, lanes_used: 40 },
      ]);

      const res = await request.put(`${endpoint}/2`).set('Cookie', admin).send({ start_time: '16:00' });

      expect(res.status).toBe(200);
      expect(res.body.map(r => r.id).sort()).toEqual([1, 2, 3]);
      const track2 = await trackReservationModel.readRows({ id: 4 });
      expect(track2[0].start_time).toBe('15:00:00');
    });

    it('refuses lanes, section or holder changes on official use, rather than ignoring them', async () => {
      const official = { date: FUTURE, start_time: '15:00:00', end_time: '17:00:00', type: 'official', association_id: null, lanes_used: 20 };
      trackReservationModel.seed([{ id: 1, ...official, track_section_id: 1 }]);

      const res = await request.put(`${endpoint}/1`).set('Cookie', admin).send({ lanes_used: 5 });

      expect(res.status).toBe(400);
    });

    it('refuses a type change: delete and create instead', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent, start_time: '12:00:00', end_time: '14:00:00' }]);

      const res = await request.put(`${endpoint}/7`).set('Cookie', admin).send({ type: 'closed' });

      expect(res.status).toBe(400);
    });

    it('clears the holder and the description with null', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent, description: 'Harjoitus', start_time: '12:00:00', end_time: '14:00:00' }]);

      const res = await request.put(`${endpoint}/7`).set('Cookie', admin).send({ association_id: null, description: null });

      expect(res.status).toBe(200);
      expect(res.body[0]).toEqual(expect.objectContaining({ association_id: null, description: null }));
    });

    it('refuses to change a past day', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent, date: PAST, start_time: '12:00:00', end_time: '14:00:00' }]);

      const res = await request.put(`${endpoint}/7`).set('Cookie', admin).send({ end_time: '15:00' });

      expect(res.status).toBe(400);
    });

    it('refuses to move a reservation into the past', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent, start_time: '12:00:00', end_time: '14:00:00' }]);

      const res = await request.put(`${endpoint}/7`).set('Cookie', admin).send({ date: PAST });

      expect(res.status).toBe(400);
    });

    it('returns 404 for an unknown reservation', async () => {
      const res = await request.put(`${endpoint}/99`).set('Cookie', admin).send({ end_time: '15:00' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('deletes a private event', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent }]);

      const res = await request.delete(`${endpoint}/7`).set('Cookie', admin);

      expect(res.status).toBe(204);
      expect(await trackReservationModel.readRows({})).toEqual([]);
    });

    it('deletes the whole official booking', async () => {
      const official = { date: FUTURE, start_time: '15:00:00', end_time: '17:00:00', type: 'official', association_id: null, lanes_used: 20 };
      trackReservationModel.seed([
        { id: 1, ...official, track_section_id: 1 },
        { id: 2, ...official, track_section_id: 2 },
        { id: 3, ...official, track_section_id: 3 },
        { id: 4, ...privateEvent, date: FUTURE },
      ]);

      const res = await request.delete(`${endpoint}/3`).set('Cookie', admin);

      expect(res.status).toBe(204);
      expect((await trackReservationModel.readRows({})).map(r => r.id)).toEqual([4]);
    });

    it('refuses to delete from a past day', async () => {
      trackReservationModel.seed([{ id: 7, ...privateEvent, date: PAST }]);

      const res = await request.delete(`${endpoint}/7`).set('Cookie', admin);

      expect(res.status).toBe(400);
    });

    it('returns 404 for an unknown reservation', async () => {
      const res = await request.delete(`${endpoint}/99`).set('Cookie', admin);

      expect(res.status).toBe(404);
    });

    it.each([['club'], ['tablet']])('refuses the %s account', async (who) => {
      trackReservationModel.seed([{ id: 7, ...privateEvent }]);

      const res = await request.delete(`${endpoint}/7`).set('Cookie', as(who));

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/track-day-copy', () => {
    const copyEndpoint = '/api/track-day-copy';
    const LATER = '2099-06-08';
    const copy = body => request.post(copyEndpoint).set('Cookie', admin).send(body);

    it('copies the track status, notice and bookings to the chosen days, official use on every section', async () => {
      const res = await copy({
        track_id: 1,
        dates: [LATER, FUTURE, LATER],
        track_supervisor: 'closed',
        notice: 'Kilpailu',
        reservations: [
          _.omit(privateEvent, 'date'),
          { type: 'official', start_time: '15:00', end_time: '17:00' },
        ],
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ dates: [FUTURE, LATER] });
      const [asked] = trackReservationModel.copies();
      expect(asked.trackId).toBe(1);
      expect(asked.dates).toEqual([FUTURE, LATER]);
      expect(asked.supervision).toEqual({ track_supervisor: 'closed', notice: 'Kilpailu' });
      expect(asked.reservations).toEqual([
        expect.objectContaining({ track_section_id: 1, lanes_used: 10, association_id: 12, start_time: '12:00:00' }),
        ...[1, 2, 3].map(id => expect.objectContaining({
          type: 'official', track_section_id: id, lanes_used: 20, association_id: null, end_time: '17:00:00',
        })),
      ]);
    });

    it('copies only what is asked: a single booking leaves status and notice alone', async () => {
      const res = await copy({ track_id: 1, dates: [FUTURE], reservations: [_.omit(privateEvent, 'date')] });

      expect(res.status).toBe(201);
      expect(trackReservationModel.copies()[0].supervision).toEqual({});
    });

    it('stores nothing and names every day that does not fit', async () => {
      const conflicts = [
        { date: FUTURE, track_section_id: 1, free: 5, total: 20 },
        { date: LATER, track_section_id: 1, free: 0, total: 20 },
      ];
      trackReservationModel.conflictNextCopy(conflicts);

      const res = await copy({ track_id: 1, dates: [FUTURE, LATER], reservations: [_.omit(privateEvent, 'date')] });

      expect(res.status).toBe(409);
      expect(res.body.conflicts).toEqual(conflicts);
    });

    it('refuses a past day among the chosen ones', async () => {
      const res = await copy({ track_id: 1, dates: [FUTURE, PAST], notice: 'x' });

      expect(res.status).toBe(400);
      expect(trackReservationModel.copies()).toEqual([]);
    });

    it('refuses a booking on a section of another track', async () => {
      const res = await copy({
        track_id: 2,
        dates: [FUTURE],
        reservations: [_.omit(privateEvent, 'date')],
      });

      expect(res.status).toBe(400);
      expect(trackReservationModel.copies()).toEqual([]);
    });

    it('refuses a copy of nothing, and a present track officer, which is the tablet\'s to mark', async () => {
      expect((await copy({ track_id: 1, dates: [FUTURE] })).status).toBe(400);
      expect((await copy({ track_id: 1, dates: [FUTURE], track_supervisor: 'present' })).status).toBe(400);
      expect(trackReservationModel.copies()).toEqual([]);
    });

    it.each([['club'], ['tablet']])('refuses the %s account', async (who) => {
      const res = await request.post(copyEndpoint).set('Cookie', as(who))
        .send({ track_id: 1, dates: [FUTURE], notice: 'x' });

      expect(res.status).toBe(403);
    });
  });
});
