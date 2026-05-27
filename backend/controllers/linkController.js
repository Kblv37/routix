const {
  createLink,
  deleteLink,
  listLinksWithStats,
  listRecentActivity
} = require('../services/linkService');
const { sanitizeNullableString, sanitizeString, sanitizeUrl } = require('../utils/sanitize');

const listLinks = async (req, res) => {
  const search = sanitizeString(req.query.search || '', 120);
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  const data = await listLinksWithStats({
    userId: req.user.id,
    page,
    limit,
    search
  });

  res.json(data);
};

const createTrackedLink = async (req, res) => {
  const targetUrl = sanitizeUrl(req.body.targetUrl);
  const customCode = sanitizeNullableString(req.body.customCode, 32);

  if (!targetUrl) {
    return res.status(400).json({ message: 'Please provide a valid target URL (http/https)' });
  }

  const link = await createLink({
    userId: req.user.id,
    targetUrl,
    customCode
  });

  return res.status(201).json({ link });
};

const removeLink = async (req, res) => {
  const linkId = Number(req.params.id);
  if (!Number.isInteger(linkId) || linkId <= 0) {
    return res.status(400).json({ message: 'Invalid link id' });
  }

  await deleteLink({ userId: req.user.id, linkId });

  return res.json({ message: 'Link deleted' });
};

const recentActivity = async (req, res) => {
  const activity = await listRecentActivity({ userId: req.user.id });
  res.json({ activity });
};

module.exports = {
  listLinks,
  createTrackedLink,
  removeLink,
  recentActivity
};
