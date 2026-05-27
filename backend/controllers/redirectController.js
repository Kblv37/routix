const { findLinkByCode } = require('../services/linkService');
const { storeClickEvent } = require('../services/clickService');
const { getGeo } = require('../services/geoService');
const { parseUserAgent } = require('../utils/userAgent');
const { sanitizeNullableString, sanitizeString } = require('../utils/sanitize');

const resolveIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
};

const redirectByCode = async (req, res) => {
  const code = sanitizeString(req.params.code, 64);
  const link = await findLinkByCode(code);

  if (!link) {
    return res.status(404).json({ message: 'Link not found' });
  }

  const ip = sanitizeString(resolveIp(req), 120);
  const userAgent = sanitizeNullableString(req.get('user-agent') || 'Unknown', 1024) || 'Unknown';
  const referer = sanitizeNullableString(req.get('referer') || '', 1024);
  const language = sanitizeNullableString(req.get('accept-language') || '', 120) || 'Unknown';

  const { browser, os, device } = parseUserAgent(userAgent);
  const geo = await getGeo(ip);

  await storeClickEvent({
    linkId: link.id,
    ip,
    userAgent,
    referer,
    country: geo.country,
    city: geo.city,
    browser,
    os,
    device,
    language
  });

  return res.redirect(302, link.target_url);
};

module.exports = {
  redirectByCode
};
