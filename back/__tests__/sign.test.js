/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const path = require('path');
const bcrypt = require('bcryptjs');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const hash = password => bcrypt.hashSync(password, config.bcrypt.hashRounds);

const endpoint = '/api/sign';

jest.mock('../models/user');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    userModel.clear();
  });

  describe('POST', () => {
    it('When no credentials are provided: returns status code 400.', async () => {
      await request.post(endpoint).send().expect(400);
    });

    it('When invalid credentials are provided: returns status code 401.', async () => {
      await request.post(endpoint)
        .send({name: 'hipsu', password: 'Aasdf123', secure: false})
        .expect(401);
    });

    it('When valid credentials are provided: returns status code 200 and sets token cookie', async () => {
      // Create user
      const user = {name: 'tiivitaavi', digest: hash('@L44L44Lee')};
      userModel.create(user);

      let res = await request.post(endpoint)
        .send({name: 'tiivitaavi', password: '@L44L44Lee', secure: false});
 
      expect(res.status).toBe(200);
      expect(res['headers']['set-cookie'][0].slice(0, 5)).toBe('token');
    });
  });
});
