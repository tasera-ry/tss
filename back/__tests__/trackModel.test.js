/* eslint-env jest */
// Mock the knex connection so the model can be exercised without a database.
jest.mock('../knex/knex', () => require('../tests/fakeKnex').createFakeKnex());

const knex = require('../knex/knex');
const model = require('../models/track');

// Fields allowed through the model's constraints.
const track = {
  range_id: 1,
  name: 'Shooting track 1',
  description: '100m Kohdistusrata',
  short_description: '100m Kohdistus',
};

describe('models/track', () => {
  beforeEach(() => {
    knex.clear();
  });

  describe('create', () => {
    it('saves the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...track, role: 'admin', digest: 'secret', unknown: 'x' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual(track);
    });

    it('does not crash on missing fields', async () => {
      await model.create({ range_id: 1, name: 'Shooting track 1' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual({
        range_id: 1,
        name: 'Shooting track 1',
      });
    });

    it.each([
      ['null', null],
      ['an array', [1, 2]],
      ['a date', new Date(0)],
      ['an object', { nested: true }],
    ])('keeps non-plain values (%s) as-is', async (_name, value) => {
      await model.create({ range_id: 1, name: 'Shooting track 1', description: value });

      expect(knex.queries().find((q) => q.op === 'insert').data.description).toBe(value);
    });
  });

  describe('update', () => {
    it('writes the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...track });

      await model.update(
        { 'track.id': 1 },
        { description: '200m Kohdistusrata', name: 'New name', role: 'admin', digest: 'secret', unknown: 'x' }
      );

      expect(knex.queries().find((q) => q.op === 'update').data).toEqual({
        description: '200m Kohdistusrata',
        name: 'New name',
      });
    });

    it('does not crash when the update contains no allowed fields', async () => {
      await model.create({ ...track });

      await model.update({ 'track.id': 1 }, { role: 'admin' });

      expect(knex.queries().find((q) => q.op === 'update').data).toEqual({});
    });
  });
});
