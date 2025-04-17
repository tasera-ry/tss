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
      const { open, close } = request.body;
      if (!open || !close) {
        return response
          .status(400)
          .send({ error: 'Open and close times are required' });
      }

      await services.upsert({ open, close });
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

