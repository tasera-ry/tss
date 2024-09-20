/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);
const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const endpoint = '/api/changeownpassword';

jest.mock('../models/user');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    userModel.clear();
  });

  describe('PUT', () => {
    it(`When a valid token is provided:
    returns code 204 and updates password.`, async () => {
      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create({ ...user, digest: 't' });

      const newPassword = 'password1234';
      const res = await request
        .put(`${endpoint}/223`)
        .set('Cookie', [`token=${jwt.sign({ id: '223' }, config.jwt.secret)}`])
        .send({ password: newPassword });

      expect(res.status).toBe(204);

      const updatedPassword = (await userModel.read({ id: '223' }))[0].digest;
      expect(bcrypt.compareSync(newPassword, updatedPassword)).toBe(true);
    });

    it(`When an invalid token is provided
    returns code 500.`, async () => {
      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create({ ...user, digest: 't' });

      const newPassword = 'password1234';
      const res = await request
        .put(`${endpoint}/223`)
        .set('Cookie', ['token=invalid'])
        .send({ password: newPassword });

      expect(res.status).toBe(500);
    });

    it(`When a valid token is provided, user is superuser and updating another users password:
    returns code 204 and updates password.`, async () => {
      await userModel.create({
        name: 'admin',
        role: 'superuser',
        id: '123',
        email: 'usr@email.com',
        digest: 't',
        reset_token: null,
        reset_token_expire: null,
      });

      const user = {
        name: 'normal',
        role: 'association',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null,
      };

      await userModel.create({ ...user, digest: 't' });

      const newPassword = 'wordpass4321';
      const res = await request
        .put(`${endpoint}/223`)
        .set('Cookie', [`token=${jwt.sign({ id: '123' }, config.jwt.secret)}`])
        .send({ password: newPassword });
      expect(res.status).toBe(204);

      const updatedPassword = (await userModel.read({ id: '223' }))[0].digest;
      expect(bcrypt.compareSync(newPassword, updatedPassword)).toBe(true);
    });
  });
});
