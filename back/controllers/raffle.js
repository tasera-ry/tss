const shiftDistributor = require('../services/shiftDistributor');
const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const serviceCalls = {
  create: async function createRaffle(request, response, next) {
    const body = response.locals.body;

    try {
      response.locals.queryResult = await services.raffle.create(body, []);
    } catch (e) {
      return next(e);
    }

    return next();
  },

  distributeShifts: async function distributeShifts(req, res) {
    try {
      console.log("✅ distributeShifts was called!");

      const totalShifts = 20; // Adjust as necessary
      const start = new Date();
      const allDates = [];

      for (let i = 0; i < totalShifts; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        allDates.push(d.toISOString().split('T')[0]);
      }

      const results = await shiftDistributor.runDistribution(totalShifts, allDates);

      return res.status(200).json({ success: true, data: results });
    } catch (err) {
      console.error("❌ Error in distributeShifts:", err);
      return res.status(500).json({ error: err.message });
    }
  }
};

module.exports = serviceCalls;