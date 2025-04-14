const knex = require('../knex/knex');

const controller = {
  // Original create function retained
  create: async function createRaffle(request, response) {
    return response
      .status(200)
      .send(response.locals.queryResult);
  },

  // New analytics endpoint
  getAnalytics: async (req, res) => {
    console.log('Analytics endpoint hit');

    try {
      const startDate = req.query.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = req.query.endDate || new Date().toISOString();

      console.log(`Querying between ${startDate} and ${endDate}`);

      const results = await knex('user')
      .where('user.role', 'association')
      .leftJoin('members', 'user.id', 'members.user_id')
      .leftJoin('scheduled_range_supervision', 'scheduled_range_supervision.association_id', 'user.id')
      .leftJoin('range_reservation', function () {
        this.on('range_reservation.id', '=', 'scheduled_range_supervision.range_reservation_id')
          .andOn('range_reservation.date', '>=', knex.raw('?', [startDate]))
          .andOn('range_reservation.date', '<=', knex.raw('?', [endDate]));
      })
      .select(
        'user.id',
        'user.name',
        knex.raw('COALESCE(members.members, 0) as card_count'),
        knex.raw('COUNT(DISTINCT scheduled_range_supervision.id) as shifts')
      )
      .groupBy('user.id', 'user.name', 'members.members')
      .timeout(5000);

      console.log(`Found ${results.length} organizations`);
      res.json(results);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        error: 'Analytics failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

module.exports = controller;