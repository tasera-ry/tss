/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');

const request = supertest(app);

const endpoint = '/api/reset';

// Mock email
jest.mock('../mailer', () => {
  const emailService = {
    email: jest.fn()
  };
  
  return emailService;
});

// Mock user module
jest.mock('../models/user', () => {
  const users = []; 

  const model = {
    read: async (key) => users.filter(user => user.email === key.email ||
                                (user.token === key.token && key.token !== undefined)),
    create: async (user) => users.push(user),
    update: jest.fn(),
    clear: () => users.length = 0
  };
  
  return model;
});

const { email } = require('../mailer.js');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    userModel.clear();
  });

  describe('/post', () => {
    it('When email exists: sets token, sends reset email and returns 200', async () => {
      const user = {email: 'tiivitaavi@hotmail.com'};
      await userModel.create(user);
      await request.post(endpoint)
        .send({email: 'tiivitaavi@hotmail.com'})
        .expect(200);
      expect(email.mock.calls.length).toBe(1);
      // expect the update function to be called twice; once for setting reset_token
      // and once for setting reset_token_expire
      expect(userModel.update.mock.calls.length).toBe(2);
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

  describe('/get', () => {
    it('When token exists and has not expired: returns 200', async () => {
      const user = {
        reset_token: 'passwordresettoken',
        reset_token_expire: (Date.now() + 3600000).toString()
      };

      await userModel.create(user);
      await request.get(endpoint)
        .send({token: 'passwordresettoken'})
        .expect(200);
    });

    it('When token exists and has expired: returns 403', async () => {
      const user = {
        reset_token: 'passwordresettoken',
        reset_token_expire: (Date.now() - 3600000).toString()
      };

      await userModel.create(user);
      await request.get(endpoint)
        .send({token: 'passwordresettoken'})
        .expect(403);
    });

    it('When token does not exist: returns 403', async () => {
      await request.get(endpoint)
        .send({token: 'passwordresettoken'})
        .expect(403);
    });
  });
});
