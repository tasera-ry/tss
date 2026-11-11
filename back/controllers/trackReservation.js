const controller = {
  read: async function readReservations(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  }
};

module.exports = controller;
