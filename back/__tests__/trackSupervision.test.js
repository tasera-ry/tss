/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const _ = require('lodash');
const request = supertest(app);
const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const jwt = require('jsonwebtoken');

const endpoint = '/api/track-supervision';

jest.mock('../models/trackSupervision');
const trackSupervisionModel = require('../models/trackSupervision');

jest.mock('../models/user');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    userModel.clear();
    trackSupervisionModel.clear();
  });

  describe('GET', () => {
    it('When requesting all supervisions returns 200 and supervisions', async () => {
      const supervision = {
        scheduled_range_supervision_id: 4825,
        track_id: 122,
        visitors: 868,
        notice: `Dicta velit eum quos ad aut dicta. Sit occaecati
          eum voluptatem ab dolorem qui temporibus nam.`,
        track_supervisor: 'closed',
      };
      await trackSupervisionModel.create(supervision);

      const res = await request.get(endpoint);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([supervision]);
    });
  });

  describe('POST', () => {
    it(`When a valid token is provided and bearer is supervisor
    returns 201 and creates new trackSupervision.`, async () => {
      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(user);

      const newSupervision = {
        scheduled_range_supervision_id: 4826,
        track_id: 123,
        visitors: 868,
        notice: 'Dicta velit eum quos ad aut dicta.',
        track_supervisor: 'closed',
      };

      const res = await request
        .post(endpoint)
        .set('Cookie', [`token=${jwt.sign({ id: '223' }, config.jwt.secret)}`])
        .send(newSupervision);

      expect(res.status).toBe(201);

      const createdSupervision = await trackSupervisionModel.read(
        _.pick(newSupervision, ['scheduled_range_supervision_id', 'track_id'])
      );
      expect(createdSupervision[0]).toStrictEqual(newSupervision);
    });

    it(`When a valid token is provided and bearer is superuser
    returns 201 and creates new trackSupervision.`, async () => {
      const user = {
        name: 'normal',
        role: 'superuser',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(user);

      const newSupervision = {
        scheduled_range_supervision_id: 4826,
        track_id: 123,
        visitors: 868,
        notice: 'Dicta velit eum quos ad aut dicta.',
        track_supervisor: 'closed',
      };

      const res = await request
        .post(endpoint)
        .set('Cookie', [`token=${jwt.sign({ id: '223' }, config.jwt.secret)}`])
        .send(newSupervision);

      expect(res.status).toBe(201);

      const createdSupervision = await trackSupervisionModel.read(
        _.pick(newSupervision, ['scheduled_range_supervision_id', 'track_id'])
      );
      expect(createdSupervision[0]).toStrictEqual(newSupervision);
    });

    it('When an invalid token is provided returns 500', async () => {
      const newSupervision = {
        scheduled_range_supervision_id: 4826,
        track_id: 123,
        visitors: 868,
        notice: 'Dicta velit eum quos ad aut dicta.',
        track_supervisor: 'closed',
      };

      const res = await request.post(endpoint).send(newSupervision);

      expect(res.status).toBe(500);

      const createdSupervision = await trackSupervisionModel.read(
        _.pick(newSupervision, ['scheduled_range_supervision_id', 'track_id'])
      );
      expect(createdSupervision.length).toBe(0);
    });
  });

  describe('GET/{scheduled_range_supervision_id}/{track_id}', () => {
    it('When requesting a specific track supervision returns 200 and supervision if supervision exists', async () => {
      const supervision = {
        scheduled_range_supervision_id: 662,
        track_id: 12,
        visitors: 828,
        notice: 'Sit occaecati eum voluptatem ab dolorem qui temporibus nam.',
        track_supervisor: 'closed',
      };
      await trackSupervisionModel.create(supervision);

      const res = await request.get(`${endpoint}/662/12`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([supervision]);
    });

    it('When requesting a specific track supervision returns 404 if supervision doesnt exist', async () => {
      const res = await request.get(`${endpoint}/662/12`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT/{scheduled_range_supervision_id}/{track_id}', () => {
    it(`When a valid token is provided, bearer is supervisor and supervision exists
    returns 204 and updates trackSupervision.`, async () => {
      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(user);

      const supervision = {
        scheduled_range_supervision_id: 4826,
        track_id: 123,
        visitors: 868,
        notice: 'Dicta velit eum quos ad aut dicta.',
        track_supervisor: 'closed',
      };

      await trackSupervisionModel.create(supervision);

      const updates = {
        visitors: 2000,
        notice: 'asd',
        track_supervisor: 'closed',
      };

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [`token=${jwt.sign({ id: '223' }, config.jwt.secret)}`])
        .send(updates);

      expect(res.status).toBe(204);

      const updatedSupervision = await trackSupervisionModel.read(
        _.pick(supervision, ['scheduled_range_supervision_id', 'track_id'])
      );

      expect(updatedSupervision[0]).toStrictEqual({ ...supervision, ...updates });
    });

    it(`When a valid token is provided but track doesnt exist
    returns 404.`, async () => {
      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(user);

      const updates = {
        visitors: 2000,
        notice: 'asd',
        track_supervisor: 'closed',
      };

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [`token=${jwt.sign({ id: '223' }, config.jwt.secret)}`])
        .send(updates);

      expect(res.status).toBe(404);
    });
  });

  describe('B10 range officer rule (#464)', () => {
    const supervisorCookie = async () => {
      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(user);

      return `token=${jwt.sign({ id: '223' }, config.jwt.secret)}`;
    };

    // A track supervision row stored 'closed', so writing 'present' is a
    // change into 'present' and is gated by the rule.
    const existingSupervision = {
      scheduled_range_supervision_id: 4826,
      track_id: 123,
      visitors: 868,
      notice: 'Dicta velit eum quos ad aut dicta.',
      track_supervisor: 'closed',
    };

    const rangeOfficer = (range_supervisor, available = true) => ({
      scheduled_range_supervision_id: 4826,
      range_supervisor,
      available,
    });

    it.each([
      ['absent', true],
      ['not confirmed', true],
      ['confirmed', true],
      ['present', false],
    ])(`When the range officer is %p (available %p), changing the track
    officer to present returns 400.`, async (range_supervisor, available) => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.create(existingSupervision);
      await trackSupervisionModel.setRangeSupervision(
        rangeOfficer(range_supervisor, available)
      );

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'present' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Range officer not present' });
    });

    it(`When no range supervision exists for the schedule, changing the
    track officer to present returns 400.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.create(existingSupervision);

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'present' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Range officer not present' });
    });

    it(`When the range officer is present, changing the track officer to
    present returns 204.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.create(existingSupervision);
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('present'));

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'present' });

      expect(res.status).toBe(204);
    });

    it(`When the track does not require a range officer, changing the
    track officer to present returns 204 while the officer is away.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.create(existingSupervision);
      await trackSupervisionModel.setTrack({
        id: 123,
        requires_range_officer: false,
      });
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('absent'));

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'present' });

      expect(res.status).toBe(204);
    });

    it(`Re-saving a day whose track officer is already marked present is
    not gated, even once the range officer has left.`, async () => {
      const cookie = await supervisorCookie();
      // In reality the row was written while the officer was on site, and
      // the officer left afterwards. The scheduling view then stores
      // 'present' and sends it back on every save of the day.
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('present'));
      await trackSupervisionModel.create({
        ...existingSupervision,
        track_supervisor: 'present',
      });
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('absent'));

      const res = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'present', visitors: 12, notice: 'asd' });

      expect(res.status).toBe(204);

      const stored = await trackSupervisionModel.read(
        _.pick(existingSupervision, ['scheduled_range_supervision_id', 'track_id'])
      );
      expect(stored[0].track_supervisor).toBe('present');
      expect(stored[0].visitors).toBe(12);
    });

    it(`Setting the track officer closed or absent while the range
    officer is away returns 204.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.create(existingSupervision);
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('absent'));

      const closed = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'closed' });
      expect(closed.status).toBe(204);

      const absent = await request
        .put(`${endpoint}/4826/123`)
        .set('Cookie', [cookie])
        .send({ track_supervisor: 'absent' });
      expect(absent.status).toBe(204);
    });

    it(`When the range officer is away, creating a track supervision
    with the officer present returns 400.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('absent'));

      const res = await request
        .post(endpoint)
        .set('Cookie', [cookie])
        .send({
          scheduled_range_supervision_id: 4826,
          track_id: 123,
          track_supervisor: 'present',
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Range officer not present' });
    });

    it(`When the range officer is present, creating a track supervision
    with the officer present returns 201.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('present'));

      const res = await request
        .post(endpoint)
        .set('Cookie', [cookie])
        .send({
          scheduled_range_supervision_id: 4826,
          track_id: 123,
          track_supervisor: 'present',
        });

      expect(res.status).toBe(201);
    });

    it(`On a track that does not require a range officer, creating a
    track supervision with the officer present returns 201 while the
    officer is away.`, async () => {
      const cookie = await supervisorCookie();
      await trackSupervisionModel.setTrack({
        id: 123,
        requires_range_officer: false,
      });
      await trackSupervisionModel.setRangeSupervision(rangeOfficer('absent'));

      const res = await request
        .post(endpoint)
        .set('Cookie', [cookie])
        .send({
          scheduled_range_supervision_id: 4826,
          track_id: 123,
          track_supervisor: 'present',
        });

      expect(res.status).toBe(201);
    });
  });

  describe('DELETE/{scheduled_range_supervision_id}/{track_id}', () => {
    it('', async () => {
      const user = {
        name: 'normal',
        role: 'superuser',
        id: '2234',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(user);

      const supervision = {
        scheduled_range_supervision_id: 4826,
        track_id: 123,
        visitors: 868,
        notice: 'Dicta velit eum quos ad aut dicta.',
        track_supervisor: 'closed',
      };

      await trackSupervisionModel.create(supervision);

      const res = await request
        .delete(`${endpoint}/4826/123`)
        .set('Cookie', [`token=${jwt.sign({ id: '2234' }, config.jwt.secret)}`])
        .send();

      expect(res.status).toBe(204);

      const deletedSupervision = await trackSupervisionModel.read(
        _.pick(supervision, ['scheduled_range_supervision_id', 'track_id'])
      );

      expect(deletedSupervision).toStrictEqual([]);
    });
  });
});
