const controller = {
  read: async function readReservations(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  create: async function createReservation(request, response) {
    return response
      .status(201)
      .send(response.locals.queryResult);
  },

  update: async function updateReservation(request, response) {
    if (response.locals.queryResult === null) {
      return response
        .status(404)
        .send({ success: false, message: 'Unknown reservation' });
    }
    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  copy: async function copyTrackDay(request, response) {
    return response
      .status(201)
      .send(response.locals.queryResult);
  },

  delete: async function deleteReservation(request, response) {
    if (response.locals.queryResult === 0) {
      return response
        .status(404)
        .send({ success: false, message: 'Unknown reservation' });
    }
    return response
      .status(204)
      .send();
  }
};

module.exports = controller;
