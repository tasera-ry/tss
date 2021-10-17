/* eslint-env jest */
const supertest = require('supertest');
const app = require('../app.js');
const request = supertest(app);


const endpoint = '/api/user';

// Mock user module
jest.mock('../models/user', () => {
  const users = [
    {name: 'admin',
      role: 'superuser',
      id: 'id123',
      email: 'usr@email.com',
      digest: 't',
      reset_token: null,
      reset_token_expire: null
    }
  ]; 

  const model = {
    read: async (params) => users.filter((user) => {
      const searchKeys = Object.keys(params);
      let match = true;
      searchKeys.forEach(key => {
        if (params[key] !== user[key]) {
          match = false;
        }
      });
      return match;
    }),
    create: async (user) => users.push(user),
    update: async (current, update) => {
      const i = users.findIndex(user => user.name === current.name);
      users[i] = {...users[i], ...update};
    },
    clear: () => users.length = 0
  };
  
  return model;
});

jest.mock('../middlewares/jwt', () => {
  const exports = { read : [
    async function checkJwt(request, response, next) {
      const path = require('path');
      const root = path.join(__dirname, '..');
      const services = require(path.join(root, 'services'));
      let users;
      try {
        const userId = {id: request.cookies.token};
        users = await services.user.read(userId);
      } catch(e) {
        return next(e.message);
      }

      if(users.length !== 1) {
        const err = Error('Authorization token didn\'t identify a user');
        err.name = 'Authorization error';
        return next(err);
      }

      response.locals.user = users.pop();
      return next();
    }
  ],
  validate: jest.fn()};

  return exports;
});

const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  it('When requesting user by name and a valid token is provided: returns code 200 and user info.', async () => {
    const user = {name: 'normal',
      role: 'supervisor',
      id: 'id223',
      email: 'usr2@email.com',
      reset_token: null,
      reset_token_expire: null
    };
    
    userModel.create({...user, digest: 't'});

    const res = await request.get(endpoint)
      .set('Cookie', ['token=id123'])
      .query({name: 'normal'});

    expect(res.status).toBe(200);
    expect(res.body).toEqual([user]);
  });
});
