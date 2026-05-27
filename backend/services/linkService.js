const { query } = require('../db');
const { generateNanoCode, normalizeCustomCode, isValidCustomCode } = require('../utils/code');

const findLinkByCode = async (code) => {
  const result = await query('SELECT id, user_id, code, target_url, created_at FROM links WHERE code = $1', [code]);
  return result.rows[0] || null;
};

const buildCode = async (customCode) => {
  const normalizedCustomCode = normalizeCustomCode(customCode);

  if (normalizedCustomCode) {
    if (!isValidCustomCode(normalizedCustomCode)) {
      const error = new Error('Custom code must be 4-32 chars and use letters, numbers, _ or -');
      error.statusCode = 400;
      throw error;
    }

    const existing = await findLinkByCode(normalizedCustomCode);
    if (existing) {
      const error = new Error('Custom code is already in use');
      error.statusCode = 409;
      throw error;
    }

    return normalizedCustomCode;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const generated = generateNanoCode();
    const existing = await findLinkByCode(generated);
    if (!existing) return generated;
  }

  const error = new Error('Failed to generate unique code. Please try again.');
  error.statusCode = 500;
  throw error;
};

const createLink = async ({ userId, targetUrl, customCode }) => {
  const code = await buildCode(customCode);

  const result = await query(
    'INSERT INTO links (user_id, code, target_url) VALUES ($1, $2, $3) RETURNING id, user_id, code, target_url, created_at',
    [userId, code, targetUrl]
  );

  return result.rows[0];
};

const deleteLink = async ({ userId, linkId }) => {
  const result = await query('DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING id', [linkId, userId]);

  if (!result.rows[0]) {
    const error = new Error('Link not found');
    error.statusCode = 404;
    throw error;
  }
};

const listLinksWithStats = async ({ userId, page = 1, limit = 10, search = '' }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;
  const searchPattern = `%${search}%`;

  const [totalResult, linksResult] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total
       FROM links
       WHERE user_id = $1 AND (code ILIKE $2 OR target_url ILIKE $2)`,
      [userId, searchPattern]
    ),
    query(
      `SELECT
        l.id,
        l.code,
        l.target_url,
        l.created_at,
        COUNT(c.id)::int AS total_clicks,
        COUNT(DISTINCT c.ip)::int AS unique_clicks,
        COUNT(CASE WHEN c.created_at::date = CURRENT_DATE THEN 1 END)::int AS today_clicks
      FROM links l
      LEFT JOIN clicks c ON c.link_id = l.id
      WHERE l.user_id = $1 AND (l.code ILIKE $2 OR l.target_url ILIKE $2)
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT $3 OFFSET $4`,
      [userId, searchPattern, safeLimit, offset]
    )
  ]);

  return {
    rows: linksResult.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: totalResult.rows[0].total,
      totalPages: Math.max(1, Math.ceil(totalResult.rows[0].total / safeLimit))
    }
  };
};

const listRecentActivity = async ({ userId, limit = 15 }) => {
  const result = await query(
    `SELECT
      c.id,
      c.created_at,
      c.country,
      c.city,
      c.browser,
      c.os,
      c.device,
      l.code,
      l.target_url
    FROM clicks c
    INNER JOIN links l ON l.id = c.link_id
    WHERE l.user_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
};

module.exports = {
  createLink,
  deleteLink,
  findLinkByCode,
  listLinksWithStats,
  listRecentActivity
};
