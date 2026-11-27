/* eslint-env jest */
// Mock the knex connection so the model can be exercised without a database.
jest.mock('../knex/knex', () => require('../tests/fakeKnex').createFakeKnex());

const knex = require('../knex/knex');
const model = require('../models/trackSupervision');

// Fields allowed through the model's constraints.
const supervision = {
  scheduled_range_supervision_id: 5,
  track_id: 2,
  track_supervisor: 'present',
  visitors: 8,
  notice: 'Shooting starts at noon',
};

describe('models/trackSupervision', () => {
  beforeEach(() => {
    knex.clear();
  });

  describe('create', () => {
    it('saves the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...supervision, role: 'supervisor', range_supervisor: 'present', unknown: 'x' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual(supervision);
    });

    it('does not crash on missing fields', async () => {
      await model.create({
        scheduled_range_supervision_id: 5,
        track_id: 2,
        track_supervisor: 'present',
      });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual({
        scheduled_range_supervision_id: 5,
        track_id: 2,
        track_supervisor: 'present',
      });
    });

    it.each([
      ['null', null],
      ['an array', [1, 2]],
      ['a date', new Date(0)],
      ['an object', { nested: true }],
    ])('keeps non-plain values (%s) as-is', async (_name, value) => {
      await model.create({
        scheduled_range_supervision_id: 5,
        track_id: 2,
        track_supervisor: 'present',
        notice: value,
      });

      expect(knex.queries().find((q) => q.op === 'insert').data.notice).toBe(value);
    });
  });
});
