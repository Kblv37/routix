-- Neon SQL Editor script for Routix
-- 1) Paste this entire file into Neon SQL Editor and run.
-- 2) Optionally run the seed block at the bottom.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS links (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(64) NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clicks (
  id BIGSERIAL PRIMARY KEY,
  link_id BIGINT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  ip VARCHAR(120) NOT NULL,
  user_agent TEXT NOT NULL,
  referer TEXT,
  country VARCHAR(120) NOT NULL DEFAULT 'Unknown',
  city VARCHAR(120) NOT NULL DEFAULT 'Unknown',
  browser VARCHAR(120) NOT NULL DEFAULT 'Unknown',
  os VARCHAR(120) NOT NULL DEFAULT 'Unknown',
  device VARCHAR(120) NOT NULL DEFAULT 'Desktop',
  language VARCHAR(120) NOT NULL DEFAULT 'Unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_ip ON clicks(ip);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_browser ON clicks(browser);
CREATE INDEX IF NOT EXISTS idx_clicks_os ON clicks(os);

-- Optional sample seed (for demo only)
-- Password for demo@routix.app is: Demo12345!
INSERT INTO users (id, email, password)
VALUES
  (1001, 'demo@routix.app', '$2b$12$4jQTuDxsMbaJhEcvwqlxiu0SIxHzkU9Lw2bI8D9vJn1T5Oya4P7Vq')
ON CONFLICT (email) DO NOTHING;

INSERT INTO links (user_id, code, target_url)
VALUES
  (1001, 'routix01', 'https://example.com/pricing'),
  (1001, 'routix02', 'https://example.com/docs')
ON CONFLICT (code) DO NOTHING;
