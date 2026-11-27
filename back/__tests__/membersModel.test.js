/* eslint-env jest */
// Mock the knex connection so the model can be exercised without a database.
jest.mock('../knex/knex', () => require('../tests/fakeKnex').createFakeKnex());

const knex = require('../knex/knex');
const model = require('../models/members');

// Fields allowed through the model's create constraints.
const members = { user_id: 7, members: 42, associations: 3 };

describe('models/members', () => {
  beforeEach(() => {
    knex.clear();
  });

  describe('create', () => {
    it('saves the allowed fields with their values and drops extra fields', async () => {
      // raffle is not in the create constraint list, even though update allows it
      await model.create({ ...members, raffle: true, role: 'admin', digest: 'secret', unknown: 'x' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual(members);
    });

    it('does not crash on missing fields', async () => {
      await model.create({ user_id: 7 });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual({ user_id: 7 });
    });

    it.each([
      ['null', null],
      ['an array', [1, 2]],
      ['a date', new Date(0)],
      ['an object', { nested: true }],
    ])('keeps non-plain values (%s) as-is', async (_name, value) => {
      await model.create({ user_id: 7, members: value });

      expect(knex.queries().find((q) => q.op === 'insert').data.members).toBe(value);
    });
  });

  describe('update', () => {
    it('writes the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...members });

      // raffle is in the update constraint list
      await model.update(
        { user_id: 7 },
        { members: 50, raffle: false, role: 'admin', digest: 'secret', unknown: 'x' }
      );

      expect(knex.queries().find((q) => q.op === 'update').data).toEqual({
        members: 50,
        raffle: false,
      });
    });

    it('does not crash when the update contains no allowed fields', async () => {
      await model.create({ ...members });

      await model.update({ user_id: 7 }, { role: 'admin' });

      expect(knex.queries().find((q) => q.op === 'update').data).toEqual({});
    });
  });
});
