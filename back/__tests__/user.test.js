/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);
const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config', 'config'));
const jwt = require('jsonwebtoken');

const endpoint = '/api/user';

jest.mock('../models/user');
const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    userModel.clear();
  });

  describe('GET', () => {
    it(`When requesting user by name and a valid token is provided:
    returns code 200 and user info.`, async () => {
      const user = {name: 'normal',
        role: 'supervisor',
        id: 'id223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null
      };

      await userModel.create({...user, digest: 't'});

      await userModel.create({name: 'admin',
        role: 'superuser',
        id: 'id123',
        email: 'usr@email.com',
        digest: 't',
        reset_token: null,
        reset_token_expire: null
      });
      
      const res = await request.get(endpoint)
        .set('Cookie', [`token=${jwt.sign({id: 'id123'}, config.jwt.secret)}`])
        .query({name: 'normal'});

      expect(res.status).toBe(200);
      expect(res.body).toEqual([user]);
    });

    // Probably should be 401 instead
    it('When invalid token is provided: returns code 500', async () => {
      await request.get(endpoint)
        .set('Cookie', ['token=THRASH'])
        .query({name: 'normal'})
        .expect(500);
    });
  });

  describe('POST', () => {
    it('When invalid token is provided: returns code 500', async () => {
      await request.post(endpoint)
        .set('Cookie', ['token=THRASH'])
        .send({name: 'normal',
          role: 'supervisor',
          id: 'id223',
          email: 'usr2@email.com',
          reset_token: null,
          reset_token_expire: null
        }).expect(500);
    });

    it('When token bearer is not superuser: returns code 403 and doesnt create user', async () => {
      await userModel.create({name: 'normal',
        role: 'supervisor',
        id: 'id223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null
      });

      await request.post(endpoint)
        .set('Cookie', [`token=${jwt.sign({id: 'id223'}, config.jwt.secret)}`])
        .send({name: 'normal2',
          role: 'supervisor',
          id: 'id2234',
          email: 'usr23@email.com',
          reset_token: null,
          reset_token_expire: null
        }).expect(403);
      
      expect(await userModel.read({id: 'id2234'})).toEqual([]);
    });

    it('When token bearer is superuser: returns code 201 and creates user', async () => {
      await userModel.create({name: 'admin',
        role: 'superuser',
        id: 'id123',
        email: 'usr@email.com',
        digest: 't',
        reset_token: null,
        reset_token_expire: null
      });

      await request.post(endpoint)
        .set('Cookie', [`token=${jwt.sign({id: 'id123'}, config.jwt.secret)}`])
        .send({name: 'normal3',
          role: 'supervisor',
          password: 'psw123',
        }).expect(201);
      
      const {digest, ...createdUser} = (await userModel.read({name: 'normal3'}))[0];
      expect(createdUser).toEqual({name: 'normal3',
        role: 'supervisor',
      });
    });
  });
});
