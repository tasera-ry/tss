const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const knex = require('../knex/knex');
const services = require('../services');

jest.mock('nodemailer');
jest.mock('node-schedule', () => ({
  RecurrenceRule: jest.fn().mockImplementation(() => ({})),
  scheduleJob: jest.fn(),
}));
jest.mock('../knex/knex', () => jest.fn());
jest.mock('../services', () => ({
  emailSettings: {
    read: jest.fn().mockResolvedValue({
      sendPendingTime: '2026-01-01T10:00:00.000Z',
    }),
  },
  user: {
    getEmail: jest.fn(),
  },
  pendingEmails: {
    add: jest.fn(),
    read: jest.fn(),
    clear: jest.fn(),
  },
}));

const mailer = require('../mailer');


const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('back/mailer.js', () => {
  let sendMailMock;
  let verifyMock;
  let consoleErrorSpy;
  let scheduleArgs;

  const mockQuery = {
    leftJoin: jest.fn(),
    where: jest.fn(),
    select: jest.fn(),
  };

  const mockEmailSettings = {
    shouldSend: 'true',
    shouldQueue: 'false',
    host: 'smtp.example.com',
    port: 587,
    secure: 'false',
    user: 'sender@example.com',
    pass: 'supersecret',
    sender: 'noreply@example.com',
    cc: 'cc@example.com',
    resetpassMsg: 'Reset your password using token: {token}',
    assignedMsg: 'You have been assigned a supervision shift.',
    updateMsg: 'Your supervision shift was updated.',
    reminderMsg: 'Reminder: confirm your supervision shift.',
    declineMsg: '{user} declined {date}',
    feedbackMsg: 'Feedback from {user}: {feedback}',
    collageMsg: 'Updates: {update}, Assigned: {assigned}',
    sendPendingTime: '2026-01-01T10:00:00.000Z',
  };

  beforeAll(async () => {
    await flushPromises();
    scheduleArgs = schedule.scheduleJob.mock.calls[0];
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mock-msg-id-123' });
    verifyMock = jest.fn((cb) => {
      if (cb) cb(null, true);
      return Promise.resolve(true);
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
      verify: verifyMock,
    });

    mockQuery.leftJoin.mockReturnValue(mockQuery);
    mockQuery.where.mockReturnValue(mockQuery);
    mockQuery.select.mockResolvedValue([]);
    knex.mockReturnValue(mockQuery);

    services.emailSettings.read.mockResolvedValue(mockEmailSettings);
    services.user.getEmail.mockResolvedValue('recipient@example.com');
  });

  afterEach(() => {
    console.log.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('email()', () => {
    test('sends password reset email with correct to, from, subject, and replaced token', async () => {
      await mailer.email('password_reset', 'user-123', { token: 'abc-reset-token' });
      await flushPromises();

      expect(services.user.getEmail).toHaveBeenCalledWith('user-123');
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        name: 'tasera.fi',
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'sender@example.com',
          pass: 'supersecret',
        },
      });

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        cc: 'cc@example.com',
        subject: 'Tasera',
        text: 'Reset your password using token: abc-reset-token',
      });
    });

    test('sends assigned email directly when queueing is off', async () => {
      await mailer.email('assigned', 'user-123', {});
      await flushPromises();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        cc: 'cc@example.com',
        subject: 'Tasera',
        text: 'You have been assigned a supervision shift.',
      });
      expect(services.pendingEmails.add).not.toHaveBeenCalled();
    });

    test('does not send email when shouldSend is not "true"', async () => {
      services.emailSettings.read.mockResolvedValueOnce({
        ...mockEmailSettings,
        shouldSend: 'false',
      });

      await mailer.email('assigned', 'user-123', {});
      await flushPromises();

      expect(nodemailer.createTransport).not.toHaveBeenCalled();
      expect(sendMailMock).not.toHaveBeenCalled();
      expect(services.pendingEmails.add).not.toHaveBeenCalled();
    });

    test('adds email to pending emails instead of sending when shouldQueue is "true" and scheduleId is given', async () => {
      services.emailSettings.read.mockResolvedValueOnce({
        ...mockEmailSettings,
        shouldQueue: 'true',
      });

      await mailer.email('assigned', 'user-123', { scheduleId: 42 });
      await flushPromises();

      expect(services.pendingEmails.add).toHaveBeenCalledWith('assigned', 'user-123', 42);
      expect(sendMailMock).not.toHaveBeenCalled();
    });

    test('sends directly even when shouldQueue is "true" if scheduleId is missing', async () => {
      services.emailSettings.read.mockResolvedValueOnce({
        ...mockEmailSettings,
        shouldQueue: 'true',
      });

      await mailer.email('assigned', 'user-123', {});
      await flushPromises();

      expect(services.pendingEmails.add).not.toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledTimes(1);
    });

    test('always sends reminders directly, even when queueing is on', async () => {
      services.emailSettings.read.mockResolvedValueOnce({
        ...mockEmailSettings,
        shouldQueue: 'true',
      });

      await mailer.email('reminder', 'user-123', { scheduleId: 42 });
      await flushPromises();

      expect(services.pendingEmails.add).not.toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          text: 'Reminder: confirm your supervision shift.',
        })
      );
    });

    test('replaces {user} and {date} in decline message', async () => {
      await mailer.email('decline', 'user-123', { user: 'Matti', date: '2026-05-01' });
      await flushPromises();

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Matti declined 2026-05-01' })
      );
    });

    test('replaces {user} and {feedback} in feedback message', async () => {
      await mailer.email('feedback', 'user-123', { user: 'Maija', feedback: 'Great app' });
      await flushPromises();

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Feedback from Maija: Great app' })
      );
    });

    test('does not throw and logs the error when sendMail fails', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP connection refused'));

      await expect(
        mailer.email('password_reset', 'user-123', { token: 'abc-reset-token' })
      ).resolves.toBeUndefined();
      await flushPromises();

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in sendEmail:', expect.any(Error));
      expect(consoleErrorSpy.mock.calls[0][1].message).toBe('SMTP connection refused');
    });

    test('uses no auth when SMTP user is not set', async () => {
      services.emailSettings.read.mockResolvedValueOnce({
        ...mockEmailSettings,
        user: '',
        pass: '',
      });

      await mailer.email('assigned', 'user-123', {});
      await flushPromises();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ auth: null })
      );
      expect(sendMailMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyEmailCredentials()', () => {
    test('calls transporter.verify with callback (correct credentials)', async () => {
      const callback = jest.fn();

      await mailer.verifyEmailCredentials(mockEmailSettings, callback);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        name: 'tasera.fi',
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'sender@example.com',
          pass: 'supersecret',
        },
      });
      expect(verifyMock).toHaveBeenCalledWith(callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('passes the error to the callback when credentials are wrong', async () => {
      const authError = new Error('Invalid login');
      verifyMock.mockImplementationOnce((cb) => {
        cb(authError);
        return Promise.resolve();
      });
      const callback = jest.fn();

      await mailer.verifyEmailCredentials({ ...mockEmailSettings, pass: 'wrong-password' }, callback);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: { user: 'sender@example.com', pass: 'wrong-password' },
        })
      );
      expect(callback).toHaveBeenCalledWith(authError);
    });

    test('rejects with structured error when creating the transport throws', async () => {
      nodemailer.createTransport.mockImplementationOnce(() => {
        throw Object.assign(new Error('bad config'), { code: 'ECONFIG', errno: -1, port: 587 });
      });

      await expect(
        mailer.verifyEmailCredentials(mockEmailSettings, jest.fn())
      ).rejects.toEqual({ message: 'bad config', code: 'ECONFIG', errno: -1, port: 587 });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('sendPending()', () => {
    test('returns success:false when there are no pending emails', async () => {
      services.pendingEmails.read.mockResolvedValueOnce([]);

      const result = await mailer.sendPending();

      expect(result).toEqual({ success: false, message: 'No messages to send.' });
      expect(sendMailMock).not.toHaveBeenCalled();
      expect(services.pendingEmails.clear).not.toHaveBeenCalled();
    });

    test('sends the message of the pending type when user has only one pending email', async () => {
      services.pendingEmails.read.mockResolvedValueOnce([
        { user_id: 'user-1', email: 'single@example.com', message_type: 'update' },
      ]);

      const result = await mailer.sendPending();

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'single@example.com',
          text: 'Your supervision shift was updated.',
        })
      );
      expect(services.pendingEmails.clear).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ success: true }]);
    });

    test('sends collage email when multiple pending messages exist for user', async () => {
      services.pendingEmails.read.mockResolvedValueOnce([
        { user_id: 'user-1', email: 'multi@example.com', message_type: 'update' },
        { user_id: 'user-1', email: 'multi@example.com', message_type: 'assigned' },
      ]);

      const result = await mailer.sendPending();

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'multi@example.com',
          text: 'Updates: 1, Assigned: 1',
        })
      );
      expect(services.pendingEmails.clear).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ success: true }]);
    });

    test('counts several messages of the same type in the collage', async () => {
      services.pendingEmails.read.mockResolvedValueOnce([
        { user_id: 'user-1', email: 'multi@example.com', message_type: 'update' },
        { user_id: 'user-1', email: 'multi@example.com', message_type: 'update' },
      ]);

      await mailer.sendPending();

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Updates: 2, Assigned: 0' })
      );
    });

    test('shows zero updates in the collage when only assigned messages are pending', async () => {
      services.pendingEmails.read.mockResolvedValueOnce([
        { user_id: 'user-1', email: 'multi@example.com', message_type: 'assigned' },
        { user_id: 'user-1', email: 'multi@example.com', message_type: 'assigned' },
      ]);

      await mailer.sendPending();

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Updates: 0, Assigned: 2' })
      );
    });

    test('sends a separate email to each user with pending messages', async () => {
      services.pendingEmails.read.mockResolvedValueOnce([
        { user_id: 'user-1', email: 'one@example.com', message_type: 'assigned' },
        { user_id: 'user-2', email: 'two@example.com', message_type: 'update' },
      ]);

      await mailer.sendPending();

      expect(sendMailMock).toHaveBeenCalledTimes(2);
      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'one@example.com' }));
      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'two@example.com' }));
    });

    test('handles sendMail failure gracefully without crashing', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP connection refused'));
      services.pendingEmails.read.mockResolvedValueOnce([
        { user_id: 'user-123', email: 'recipient@example.com', message_type: 'assigned' },
      ]);

      await expect(mailer.sendPending()).resolves.toBeDefined();

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in sendEmail:', expect.any(Error));
    });

    test('returns success:false and the error message when reading pending emails fails', async () => {
      services.pendingEmails.read.mockRejectedValueOnce(new Error('db error'));

      const result = await mailer.sendPending();

      expect(result).toEqual({ success: false, error: 'db error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in sendPending:', expect.any(Error));
      expect(sendMailMock).not.toHaveBeenCalled();
    });

    test.todo('does not clear pending emails when sending failed');
    test.todo('does not send pending emails when shouldSend is not "true"');
  });

  describe('scheduleEmailReminder()', () => {
    test('schedules a daily job in Europe/Helsinki timezone with the minute from settings', () => {
      expect(scheduleArgs).toBeDefined();
      const [rule, callback] = scheduleArgs;

      expect(rule).toMatchObject({ minute: '00', second: 0, tz: 'Europe/Helsinki' });
      expect(typeof callback).toBe('function');
    });

    test('uses the given settings without reading them from the service', async () => {
      await mailer.scheduleEmailReminder(mockEmailSettings);

      expect(services.emailSettings.read).not.toHaveBeenCalled();
      expect(schedule.scheduleJob).toHaveBeenCalledTimes(1);
    });

    describe('scheduled job', () => {
      const runJob = () => scheduleArgs[1]();

      const dateIn7Days = () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
      };

      test('queries supervisions 7 days ahead', async () => {
        const before = dateIn7Days();
        await runJob();
        const after = dateIn7Days();

        expect(knex).toHaveBeenCalledWith('user');
        expect(mockQuery.where).toHaveBeenCalledTimes(1);
        const [column, operator, date] = mockQuery.where.mock.calls[0];
        expect(column).toBe('range_reservation.date');
        expect(operator).toBe('=');
        expect([before, after]).toContain(date);
      });

      test('sends reminder when supervisor is not confirmed', async () => {
        mockQuery.select.mockResolvedValueOnce([
          { association_id: 'assoc-1', range_supervisor: 'not confirmed' },
        ]);

        await runJob();
        await flushPromises();

        expect(services.user.getEmail).toHaveBeenCalledWith('assoc-1');
        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'recipient@example.com',
            text: 'Reminder: confirm your supervision shift.',
          })
        );
      });

      test('does not send reminder when supervisor is already confirmed', async () => {
        mockQuery.select.mockResolvedValueOnce([
          { association_id: 'assoc-1', range_supervisor: 'Matti Meikäläinen' },
        ]);

        await runJob();
        await flushPromises();

        expect(sendMailMock).not.toHaveBeenCalled();
      });

      test('does not send reminder when there are no supervisions on that date', async () => {
        mockQuery.select.mockResolvedValueOnce([]);

        await runJob();
        await flushPromises();

        expect(sendMailMock).not.toHaveBeenCalled();
      });

      test('also processes pending emails', async () => {
        await runJob();
        await flushPromises();

        expect(services.pendingEmails.read).toHaveBeenCalled();
      });

      test('logs the error and does not throw when the database query fails', async () => {
        mockQuery.select.mockRejectedValueOnce(new Error('db down'));

        await expect(runJob()).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in scheduled job:', expect.any(Error));
        expect(sendMailMock).not.toHaveBeenCalled();
      });

      test.todo('sends reminders to all unconfirmed supervisions of the date, not only the first');
    });
  });
});