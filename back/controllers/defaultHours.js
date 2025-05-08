const services = require('../services/defaultHours');

const controller = {
  read: async function readDefaultHours(request, response) {
    try {
      console.log('Fetching default hours from the database');
      const result = await services.read();
      return response.status(200).send(result);
    } catch (error) {
      console.error('Failed to read default hours:', error);
      return response
        .status(500)
        .send({ error: 'Failed to read default hours' });
    }
  },

  update: async function updateDefaultHours(request, response) {
    try {
      const { default_hours } = request.body;
      if (!default_hours || typeof default_hours !== 'object') {
        return response
          .status(400)
          .send({
            error: 'Default hours with open and close times are required',
          });
      }

      const weekdays = [];
      for (const [day, times] of Object.entries(default_hours)) {
        const { open, close } = times;
        if (!open || !close) {
          return response.status(400).send({
            error: `Each day (${day}) must have open and close times`,
          });
        }
        weekdays.push({ day, open, close });
      }

      await services.upsert(weekdays);
      return response.status(204).send();
    } catch (error) {
      console.error('Failed to update default hours:', error);
      return response
        .status(500)
        .send({ error: 'Failed to update default hours' });
    }
  },
};

module.exports = controller;

