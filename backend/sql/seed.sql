-- Routix sample seed data (optional)
-- Use only for local development/demo

INSERT INTO users (id, email, password)
VALUES
  (1001, 'demo@routix.app', '$2b$12$4jQTuDxsMbaJhEcvwqlxiu0SIxHzkU9Lw2bI8D9vJn1T5Oya4P7Vq')
ON CONFLICT (email) DO NOTHING;

INSERT INTO links (user_id, code, target_url)
VALUES
  (1001, 'routix01', 'https://example.com/pricing'),
  (1001, 'routix02', 'https://example.com/docs')
ON CONFLICT (code) DO NOTHING;

INSERT INTO clicks (link_id, ip, user_agent, referer, country, city, browser, os, device, language, created_at)
SELECT l.id, '91.204.180.17', 'Mozilla/5.0 Chrome/124.0.0.0', 'https://google.com', 'Uzbekistan', 'Tashkent', 'Chrome', 'Windows', 'Desktop', 'en-US', NOW() - INTERVAL '1 day'
FROM links l WHERE l.code = 'routix01'
UNION ALL
SELECT l.id, '88.214.45.11', 'Mozilla/5.0 Safari/537.36', 'https://youtube.com', 'Kazakhstan', 'Almaty', 'Safari', 'iOS', 'Mobile', 'ru-RU', NOW() - INTERVAL '3 hours'
FROM links l WHERE l.code = 'routix02';
