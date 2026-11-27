/* eslint-env jest */
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/rangeDay');
jest.mock('../models/user');
jest.mock('../mailer', () => ({
  email: jest.fn(),
  sendPending: jest.fn(),
  verifyEmailCredentials: jest.fn(),
  scheduleEmailReminder: jest.fn(),
}));

const app = require('../app.js');
const config = require('../config/config');
const nextRangeSupervision = require('../knex/rangeOfficerRule');
const rangeDayModel = require('../models/rangeDay');
const userModel = require('../models/user');
const { email } = require('../mailer');

const request = supertest(app);

describe('range officer status after the admin saves the day', () => {
  const reset = { arriving_at: null, rangeofficer_id: null };

  it('starts a new holder unconfirmed and forgets the old arrival time', () => {
    expect(nextRangeSupervision({ range_supervisor: 'confirmed' }, 12, 13))
      .toEqual({ range_supervisor: 'not confirmed', ...reset });
    expect(nextRangeSupervision(undefined, null, 13))
      .toEqual({ range_supervisor: 'not confirmed', ...reset });
  });

  it('keeps what the same holder confirmed or the tablet marked', () => {
    expect(nextRangeSupervision({ range_supervisor: 'confirmed' }, 12, 12)).toBeNull();
    expect(nextRangeSupervision({ range_supervisor: 'present' }, 12, 12)).toBeNull();
    expect(nextRangeSupervision({ range_supervisor: 'not confirmed' }, 12, 12)).toBeNull();
  });

  it('asks a holder who declined to confirm again', () => {
    expect(nextRangeSupervision({ range_supervisor: 'absent' }, 12, 12))
      .toEqual({ range_supervisor: 'not confirmed', ...reset });
  });

  it('marks a day without a holder absent, and leaves an absent day alone', () => {
    expect(nextRangeSupervision({ range_supervisor: 'present' }, 12, null))
      .toEqual({ range_supervisor: 'absent', ...reset });
    expect(nextRangeSupervision({ range_supervisor: 'absent' }, null, null)).toBeNull();
    expect(nextRangeSupervision(undefined, null, null)).toBeNull();
  });
});

describe('PUT /api/range-day', () => {
  const FUTURE = '2099-06-01';
  const LATER = '2099-06-08';
  const as = id => [`token=${jwt.sign({ id }, config.jwt.secret)}`];
  const write = (body, cookie = as('admin')) =>
    request.put('/api/range-day').set('Cookie', cookie).send(body);

  beforeEach(async () => {
    jest.resetAllMocks();
    email.mockResolvedValue();
    rangeDayModel.clear();
    userModel.clear();
    await userModel.create({ id: 'admin', name: 'admin', role: 'superuser' });
    await userModel.create({ id: 'club', name: 'club', role: 'association' });
    await userModel.create({ id: 12, name: 'Hirviseura', role: 'association' });
    await userModel.create({ id: 13, name: 'Toinen seura', role: 'association' });
    await userModel.create({ id: 14, name: 'Toinen pääkäyttäjä', role: 'superuser' });
  });

  it('writes the settings to every chosen day once, in date order', async () => {
    const res = await write({
      dates: [LATER, FUTURE, LATER],
      available: true,
      open: '09:00',
      close: '16:30',
      association_id: 12,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ dates: [FUTURE, LATER] });
    expect(rangeDayModel.writes()).toEqual([{
      dates: [FUTURE, LATER],
      changes: { available: true, open: '09:00:00', close: '16:30:00', association_id: 12 },
    }]);
  });

  it('writes only what is sent, and null clears the shift', async () => {
    expect((await write({ dates: [FUTURE], available: false })).status).toBe(200);
    expect((await write({ dates: [FUTURE], association_id: null })).status).toBe(200);

    expect(rangeDayModel.writes().map(w => w.changes)).toEqual([
      { available: false },
      { association_id: null },
    ]);
  });

  it('refuses past days, half the hours, hours that end first, and nothing to write', async () => {
    const refused = [
      [{ dates: ['2000-01-01'], available: true }, 'Past days are read-only'],
      [{ dates: [FUTURE], open: '09:00' }, 'Opening hours need both open and close'],
      [{ dates: [FUTURE], open: '16:00', close: '16:00' }, 'The range must close after it opens'],
      [{ dates: [FUTURE] }, 'Nothing to write'],
    ];
    for (const [body, message] of refused) {
      const res = await write(body);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(message);
    }
    expect(rangeDayModel.writes()).toEqual([]);
  });

  it('refuses a shift for an account that is not an association', async () => {
    const res = await write({ dates: [FUTURE], association_id: 14 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Unknown association');
    expect(rangeDayModel.writes()).toEqual([]);
  });

  it('refuses malformed values before they reach the service', async () => {
    for (const body of [
      { dates: [], available: true },
      { dates: ['1.6.2099'], available: true },
      { dates: [FUTURE], available: 'yes' },
      { dates: [FUTURE], open: '25:00', close: '26:00' },
    ]) {
      expect((await write(body)).status).toBe(400);
    }
    expect(rangeDayModel.writes()).toEqual([]);
  });

  it('is for admins only', async () => {
    const res = await write({ dates: [FUTURE], available: true }, as('club'));

    expect(res.status).toBe(403);
    expect(rangeDayModel.writes()).toEqual([]);
  });

  describe('emails to the associations', () => {
    const day = changes => ({ date: FUTURE, scheduleId: 7, from: null, to: null,
      changed: true, assigned: false, ...changes });

    it('asks a new holder to confirm and tells the previous one', async () => {
      rangeDayModel.answerNextWrite([day({ from: 12, to: 13, assigned: true })]);
      await write({ dates: [FUTURE], association_id: 13 });

      expect(email.mock.calls).toEqual([
        ['assigned', 13, { scheduleId: 7 }],
        ['update', 12, { scheduleId: 7 }],
      ]);
    });

    it('updates the holder when the day changes, and stays quiet when nothing did', async () => {
      rangeDayModel.answerNextWrite([day({ from: 12, to: 12 })]);
      await write({ dates: [FUTURE], open: '10:00', close: '15:00' });
      rangeDayModel.answerNextWrite([day({ from: 12, to: 12, changed: false })]);
      await write({ dates: [FUTURE], open: '10:00', close: '15:00' });

      expect(email.mock.calls).toEqual([['update', 12, { scheduleId: 7 }]]);
    });

    it('tells the previous holder when the shift is cleared', async () => {
      rangeDayModel.answerNextWrite([day({ from: 12, to: null })]);
      await write({ dates: [FUTURE], association_id: null });

      expect(email.mock.calls).toEqual([['update', 12, { scheduleId: 7 }]]);
    });

    it('sends one email per copied day', async () => {
      rangeDayModel.answerNextWrite([
        day({ to: 12, assigned: true }),
        day({ date: LATER, scheduleId: 8, from: 12, to: 12, changed: false }),
      ]);
      await write({ dates: [FUTURE, LATER], association_id: 12 });

      expect(email.mock.calls).toEqual([['assigned', 12, { scheduleId: 7 }]]);
    });
  });
});
