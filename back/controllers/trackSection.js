const controller = {
  read: async function readSections(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  create: async function createSection(request, response) {
    return response.status(201).send(response.locals.queryResult);
  },

  update: async function updateSection(request, response) {
    if (response.locals.queryResult === null) return response.status(404).send();
    return response.status(200).send(response.locals.queryResult);
  },

  delete: async function deleteSection(request, response) {
    return response.status(response.locals.queryResult ? 204 : 404).send();
  }
};

module.exports = controller;
