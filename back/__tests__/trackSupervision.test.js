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
