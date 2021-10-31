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

// Mock user model
jest.mock('../models/user', () => {
  const users = [
    {name: 'admin',
      role: 'superuser',
      id: '123',
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
    create: async (user) => { 
      users.push(user);
      return [user];
    },
    update: async (current, update) => {
      const i = users.findIndex(user => user.id == current.id);
      users[i] = {...users[i], ...update};
    },
    clear: () => users.length = 0
  };
  
  return model;
});

const userModel = require('../models/user');

describe(`${endpoint}`, () => {
  

  describe('PUT', () => {
    it(`When a valid token is provided:
    returns code 204 and updates password.`, async () => {
      const user = {name: 'normal',
        role: 'supervisor',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null
      };

      await userModel.create({...user, digest: 't'});
      
      const newPassword = 'password1234';
      const res = await request.put(`${endpoint}/223`)
        .set('Cookie', [`token=${jwt.sign({id: '223'}, config.jwt.secret)}`])
        .send({password: newPassword});

      expect(res.status).toBe(204);

      const updatedPassword = (await (userModel.read({id: '223'})))[0].digest;
      expect(bcrypt.compareSync(newPassword, updatedPassword)).toBe(true);
    });

    it(`When an invalid token is provided
    returns code 500.`, async () => {
      const user = {name: 'normal',
        role: 'supervisor',
        id: '223',
        email: 'usr2@email.com',
        reset_token: null,
        reset_token_expire: null
      };

      await userModel.create({...user, digest: 't'});
      
      const newPassword = 'password1234';
      const res = await request.put(`${endpoint}/223`)
        .set('Cookie', ['token=invalid'])
        .send({password: newPassword});

      expect(res.status).toBe(500);
    });

    it(`When a valid token is provided, user is superuser and updating another users password:
    returns code 204 and updates password.`, async () => {
      const newPassword = 'wordpass4321';
      const res = await request.put(`${endpoint}/223`)
        .set('Cookie', [`token=${jwt.sign({id: '123'}, config.jwt.secret)}`])
        .send({password: newPassword});
      //console.log(res);
      expect(res.status).toBe(204);

      const updatedPassword = (await (userModel.read({id: '223'})))[0].digest;
      expect(bcrypt.compareSync(newPassword, updatedPassword)).toBe(true);
    });

  });
});
