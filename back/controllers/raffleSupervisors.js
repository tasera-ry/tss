const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const controller = {
  set: async function setRaffledSupervisors (req, res) {
    try {
      const raffleResults = req.body.results;
      const resa = await services.raffleSupervisors.set(raffleResults);
      console.log(resa);
      res.sendStatus(200);
    } catch (e) {
      console.log(e);
      res.send(500);
    }
  }
};

module.exports = controller;
