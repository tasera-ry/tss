const controller = {
  read: async function readSections(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  }
};

module.exports = controller;
