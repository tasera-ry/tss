/* eslint-env jest */
// Mock the knex connection so the model can be exercised without a database.
jest.mock('../knex/knex', () => require('../tests/fakeKnex').createFakeKnex());

const knex = require('../knex/knex');
const model = require('../models/user');

// Fields allowed through the model's user constraint list.
const user = {
  name: 'Mark',
  digest: 'password_digest',
  role: 'superuser',
  email: 'mark@email.com',
};

describe('models/user', () => {
  beforeEach(() => {
    knex.clear();
  });

  describe('create', () => {
    it('saves the allowed user fields with their values and drops extra fields', async () => {
      await model.create({
        ...user,
        phone: '+358 40 1234567',
        associationId: 3,
        reset_token: 'token',
        reset_token_expire: new Date(0),
        unknown: 'x',
      });

      expect(knex.queries().find((q) => q.op === 'insert' && q.table === 'user').data).toEqual(user);
    });

    it('does not crash on missing fields', async () => {
      await model.create({ name: 'Mark' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual({ name: 'Mark' });
    });

    it.each([
      ['null', null],
      ['an array', [1, 2]],
      ['a date', new Date(0)],
      ['an object', { nested: true }],
    ])('keeps non-plain values (%s) as-is', async (_name, value) => {
      await model.create({ name: value, digest: 'password_digest', role: 'superuser' });

      expect(knex.queries().find((q) => q.op === 'insert').data.name).toBe(value);
    });

    // The association constraint list ({ phone }) is used when role is 'association'.
    it('with role association, also inserts the phone from the association field list', async () => {
      await model.create({ ...user, role: 'association', phone: '+358 40 1234567', associationId: 3 });

      const inserts = knex.queries().filter((q) => q.op === 'insert');
      expect(inserts.map((q) => q.table)).toEqual(['user', 'association']);
      expect(inserts[0].data).toEqual({ ...user, role: 'association' });
      expect(inserts[1].data).toEqual({ user_id: 1, phone: '+358 40 1234567' });
    });

    // The officer constraint list ({ associationId }) is used when role is 'rangeofficer'.
    it('with role rangeofficer, also inserts the associationId from the officer field list', async () => {
      await model.create({ ...user, role: 'rangeofficer', phone: '+358 40 1234567', associationId: 3 });

      const inserts = knex.queries().filter((q) => q.op === 'insert');
      expect(inserts.map((q) => q.table)).toEqual(['user', 'association_rangeofficers']);
      expect(inserts[1].data).toEqual({ rangeofficer_id: 1, association_id: 3 });
    });
  });
});
