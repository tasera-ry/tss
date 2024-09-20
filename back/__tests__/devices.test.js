/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const _ = require('lodash');
const request = supertest(app);
const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const jwt = require('jsonwebtoken');

const endpoint = '/api/devices';

jest.mock('../models/devices');
const deviceModel = require('../models/devices');

jest.mock('../models/user');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    deviceModel.clear();
  });

  describe('GET', () => {
    it('Requesting devices returns a list of devices with status code 200', async () => {
      const devices = [
        { device_name: 'device1', status: 'free' },
        { device_name: 'device2', status: 'reserved' },
      ];

      await deviceModel.create({ ...devices[0] });
      await deviceModel.create({ ...devices[1] });

      const res = await request.get(endpoint);

      expect(res.status).toBe(200);
      expect(_.isEqual(res.body, devices)).toBe(true);
    });

    it('Requesting a single device retunrs the device with status code 200', async () => {
      const device = { device_name: 'device1', status: 'free' };

      await deviceModel.create({ ...device });

      const res = await request.get(endpoint).query({ name: 'device1' });

      expect(res.status).toBe(200);
      expect(_.isEqual(res.body, [device])).toBe(true);
    });
  });

  describe('POST', () => {
    it('Creating a device returns the device with status code 201', async () => {
      const superuser = {
        name: 'user',
        role: 'superuser',
        id: '123',
        email: 'user@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create(superuser);

      const device = { device_name: 'device1', status: 'free' };

      const res = await request
        .post(endpoint)
        .send(device)
        .set('Cookie', [`token=${jwt.sign({ id: '123' }, config.jwt.secret)}`]);

      expect(res.status).toBe(201);
      expect(_.isEqual(res.body[0], device)).toBe(true);
    });
  });
});
