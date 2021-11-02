/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);

const endpoint = '/api/signout';

describe(`${endpoint}`, () => {
  describe('POST', () => {
    it('When called: removes token cookie', async () => {
      await request.post(endpoint)
        .expect('set-cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });
  });
});
