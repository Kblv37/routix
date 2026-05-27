const { getOverviewAnalytics } = require('../services/analyticsService');

const getOverview = async (req, res) => {
  const analytics = await getOverviewAnalytics(req.user.id);
  res.json(analytics);
};

module.exports = {
  getOverview
};
