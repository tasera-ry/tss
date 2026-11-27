/* eslint-env jest */
// Mock the knex connection so the model can be exercised without a database.
jest.mock('../knex/knex', () => require('../tests/fakeKnex').createFakeKnex());

const knex = require('../knex/knex');
const model = require('../models/devices');

// Fields allowed through the model's constraints.
const device = { device_name: 'Timer 1', status: 'free' };

describe('models/devices', () => {
  beforeEach(() => {
    knex.clear();
  });

  describe('create', () => {
    it('saves the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...device, role: 'admin', digest: 'secret', unknown: 'x' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual(device);
    });

    it('does not crash on missing fields', async () => {
      await model.create({ device_name: 'Timer 1' });

      expect(knex.queries().find((q) => q.op === 'insert').data).toEqual({ device_name: 'Timer 1' });
    });

    it.each([
      ['null', null],
      ['an array', [1, 2]],
      ['a date', new Date(0)],
      ['an object', { nested: true }],
    ])('keeps non-plain values (%s) as-is', async (_name, value) => {
      await model.create({ device_name: 'Timer 1', status: value });

      expect(knex.queries().find((q) => q.op === 'insert').data.status).toBe(value);
    });
  });

  describe('update', () => {
    it('writes the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...device });

      await model.update(
        { 'device.id': 1 },
        { status: 'reserved', device_name: 'Timer 2', role: 'admin', digest: 'secret', unknown: 'x' }
      );

      expect(knex.queries().find((q) => q.op === 'update').data).toEqual({
        status: 'reserved',
        device_name: 'Timer 2',
      });
    });

    it('does not crash when the update contains no allowed fields', async () => {
      await model.create({ ...device });

      await model.update({ 'device.id': 1 }, { role: 'admin' });

      expect(knex.queries().find((q) => q.op === 'update').data).toEqual({});
    });
  });
});
