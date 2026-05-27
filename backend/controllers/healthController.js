const health = async (req, res) => {
  res.json({
    status: 'ok',
    service: 'routix-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  });
};

module.exports = {
  health
};
