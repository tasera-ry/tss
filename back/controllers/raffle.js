const controller = {
  create: async function createRaffle(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  }
};

module.exports = controller;