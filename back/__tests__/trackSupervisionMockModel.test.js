/* eslint-env jest */
const model = require('../models/__mocks__/trackSupervision');

// Fields allowed through the model's constraints.
const supervision = {
  scheduled_range_supervision_id: 5,
  track_id: 2,
  track_supervisor: 'present',
  visitors: 8,
  notice: 'Shooting starts at noon',
};

describe('models/__mocks__/trackSupervision', () => {
  beforeEach(() => {
    return model.clear();
  });

  describe('create', () => {
    it('saves the allowed fields with their values and drops extra fields', async () => {
      await model.create({ ...supervision, role: 'supervisor', range_supervisor: 'present', unknown: 'x' });

      expect(await model.read({ scheduled_range_supervision_id: 5, track_id: 2 })).toEqual([
        supervision,
      ]);
    });

    it('does not crash on missing fields', async () => {
      await model.create({ scheduled_range_supervision_id: 5, track_id: 2 });

      expect(await model.read({ scheduled_range_supervision_id: 5, track_id: 2 })).toEqual([
        { scheduled_range_supervision_id: 5, track_id: 2 },
      ]);
    });
  });
});
