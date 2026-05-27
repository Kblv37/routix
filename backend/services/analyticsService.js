const { query } = require('../db');

const getOverviewAnalytics = async (userId) => {
  const [summary, topBrowsers, topOs, topCountries, clicksOverTimeRaw] = await Promise.all([
    query(
      `SELECT
        COUNT(c.id)::int AS total_clicks,
        COUNT(DISTINCT c.ip)::int AS unique_clicks,
        COUNT(CASE WHEN c.created_at::date = CURRENT_DATE THEN 1 END)::int AS clicks_today
      FROM links l
      LEFT JOIN clicks c ON c.link_id = l.id
      WHERE l.user_id = $1`,
      [userId]
    ),
    query(
      `SELECT c.browser AS label, COUNT(*)::int AS value
      FROM clicks c
      INNER JOIN links l ON l.id = c.link_id
      WHERE l.user_id = $1
      GROUP BY c.browser
      ORDER BY value DESC
      LIMIT 5`,
      [userId]
    ),
    query(
      `SELECT c.os AS label, COUNT(*)::int AS value
      FROM clicks c
      INNER JOIN links l ON l.id = c.link_id
      WHERE l.user_id = $1
      GROUP BY c.os
      ORDER BY value DESC
      LIMIT 5`,
      [userId]
    ),
    query(
      `SELECT c.country AS label, COUNT(*)::int AS value
      FROM clicks c
      INNER JOIN links l ON l.id = c.link_id
      WHERE l.user_id = $1
      GROUP BY c.country
      ORDER BY value DESC
      LIMIT 5`,
      [userId]
    ),
    query(
      `SELECT
        EXTRACT(YEAR FROM c.created_at)::int AS year,
        EXTRACT(MONTH FROM c.created_at)::int AS month,
        EXTRACT(DAY FROM c.created_at)::int AS day,
        COUNT(*)::int AS value
      FROM clicks c
      INNER JOIN links l ON l.id = c.link_id
      WHERE l.user_id = $1
        AND c.created_at >= NOW() - INTERVAL '14 days'
      GROUP BY year, month, day
      ORDER BY year, month, day`,
      [userId]
    )
  ]);

  const clicksOverTime = clicksOverTimeRaw.rows.map((item) => ({
    day: `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
    value: item.value
  }));

  return {
    summary: summary.rows[0] || { total_clicks: 0, unique_clicks: 0, clicks_today: 0 },
    topBrowsers: topBrowsers.rows,
    topOs: topOs.rows,
    topCountries: topCountries.rows,
    clicksOverTime
  };
};

module.exports = {
  getOverviewAnalytics
};
