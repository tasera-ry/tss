/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const bcrypt = require('bcryptjs');

const request = supertest(app);

const endpoint = '/api/reset';

// Mock email
jest.mock('../mailer', () => {
  const emailService = {
    email: jest.fn()
  };
  
  return emailService;
});

const { email } = require('../mailer.js');

jest.mock('../models/user');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    userModel.clear();
  });

  describe('POST', () => {
    it('When email exists: sets token, sends reset email and returns 200', async () => {
      const user = {email: 'tiivitaavi@hotmail.com'};
      await userModel.create(user);
      await request.post(endpoint)
        .send({email: 'tiivitaavi@hotmail.com'})
        .expect(200);
      expect(email.mock.calls.length).toBe(1);
      const updatedUser = (await userModel.read(user))[0];
      expect(updatedUser.reset_token).toEqual(expect.anything());
      expect(updatedUser.reset_token_expire).toEqual(expect.anything());
    });

    it('When email does not exist: returns 403', async () => {
      const user = {email: 'laalaa@hotmail.com'};
      await userModel.create(user);
      await request.post(endpoint)
        .send({email: 'tiivitaavi@hotmail.com'})
        .expect(403);
    });
    
    it('When no email is provided: returns 400', async () => {
      await request.post(endpoint)
        .send({})
        .expect(400);
    });

    it('When email is empty string: returns 400', async () => {
      await request.post(endpoint)
        .send({email: ''})
        .expect(400);
    });
  });

  describe('GET', () => {
    it('When token exists and has not expired: returns 200', async () => {
      const user = {
        reset_token: 'passwordresettoken',
        reset_token_expire: (Date.now() + 3600000).toString()
      };

      await userModel.create(user);
      await request.get(endpoint)
        .query({reset_token: 'passwordresettoken'})
        .expect(200);
    });

    it('When token exists and has expired: returns 403', async () => {
      const user = {
        reset_token: 'passwordresettoken',
        reset_token_expire: (Date.now() - 3600000).toString()
      };

      await userModel.create(user);
      await request.get(endpoint)
        .query({reset_token: 'passwordresettoken'})
        .expect(403);
    });

    it('When token does not exist: returns 403', async () => {
      await request.get(endpoint)
        .query({reset_token: 'passwordresettoken'})
        .expect(403);
    });
  });

  describe('PUT', () => {
    it('When user exists and reset_token exists: change user password and set reset_token null, returns 200', async () => {
      const user = {name: 'usr', reset_token: 'rsttoken'};
      const req = {username: 'usr',
        reset_token: 'rsttoken',
        newPassword: 'new'};
      await userModel.create(user);
      await request.put(endpoint)
        .send(req)
        .expect(200);
      
      const updatedUser = (await userModel.read({name: user.name}))[0];
      expect(bcrypt.compareSync(req.newPassword, updatedUser.digest)).toEqual(true);
      expect(updatedUser.reset_token).toEqual(null);
      expect(updatedUser.reset_token_expire).toEqual(null);
    });

    it('When token does not exist: returns 403', async () => {
      const user = {name: 'usr', reset_token: 'rsttoken'};
      const req = {username: 'usr',
        reset_token: 's',
        newPassword: 'new'};
      await userModel.create(user);
      await request.put(endpoint)
        .send(req)
        .expect(403);
    });

    it('When user does not exist: returns 403', async () => {
      const user = {name: 'usr', reset_token: 'rsttoken'};
      const req = {username: 'usrs',
        reset_token: 's',
        newPassword: 'new'};
      await userModel.create(user);
      await request.put(endpoint)
        .send(req)
        .expect(403);
    });
  });
});
