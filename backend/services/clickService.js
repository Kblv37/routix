const { query } = require('../db');

const storeClickEvent = async ({
  linkId,
  ip,
  userAgent,
  referer,
  country,
  city,
  browser,
  os,
  device,
  language
}) => {
  await query(
    `INSERT INTO clicks (
      link_id,
      ip,
      user_agent,
      referer,
      country,
      city,
      browser,
      os,
      device,
      language
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [linkId, ip, userAgent, referer, country, city, browser, os, device, language]
  );
};

module.exports = {
  storeClickEvent
};
