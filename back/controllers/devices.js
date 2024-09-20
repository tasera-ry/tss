const controller = {
  read: async function readDevice(request, response) {
    if (response.locals.queryResult.length === 0 && !response.locals.filtered) {
      return response.status(404).send({
        error: 'Unknown device',
      });
    }

    return response.status(200).send(response.locals.queryResult);
  },

  create: async function createDevice(request, response) {
    return response.status(201).send(response.locals.queryResult);
  },

  update: async function updateDevice(request, response) {
    return response.status(204).send();
  },

  delete: async function deleteDevice(request, response) {
    if (response.locals.queryResult === 0) {
      return response.status(404).send({
        error: `No device exists matching id ${response.locals.query.id}`,
      });
    }

    return response.status(204).send();
  },
};

module.exports = controller;
