# Routix - Production-Ready MVP SaaS

Routix is a SaaS platform for creating redirect/tracking links with user auth, analytics dashboard, and click-level tracking.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript, Chart.js
- Backend: Node.js, Express.js
- Database: PostgreSQL (Neon)
- Deploy:
  - Frontend -> Netlify
  - Backend -> Render

## Project Structure

```text
routix/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── sql/
│   ├── utils/
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   ├── render.yaml
│   ├── README.md
│   └── server.js
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── .env.example
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── netlify.toml
│   ├── package.json
│   ├── README.md
│   └── register.html
├── package.json
├── render.yaml
└── README.md
```

## Features

- User auth: register, login, logout, protected routes
- JWT auth + bcrypt-compatible password hashing (bcryptjs)
- Link creation with optional custom code or auto nanoid
- Redirect endpoint: `GET /r/:code`
- Click tracking: IP, UA, referer, country, city, browser, OS, device, language, timestamp
- Dashboard analytics:
  - Total clicks
  - Unique clicks
  - Clicks today
  - Top browsers
  - Top OS
  - Top countries
  - Recent activity
  - Charts (line + doughnut)
- SaaS-style responsive UI (dark, glassmorphism)
- Search + pagination + loading skeletons + toasts + empty states
- Copy link + QR generation
- Production security (helmet, cors, rate-limit, input sanitization)

## 1) Local Setup

Prerequisites:

- Node.js 18+
- npm 9+
- Neon PostgreSQL database URL

Clone/open project folder, then:

```bash
npm install
```

This installs root + backend + frontend dependencies using npm workspaces.

## 2) Run Project (Dev)

Create environment file first:

```bash
cp backend/.env.example backend/.env
```

Update values in `backend/.env` (see below).

Start full project:

```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

If `DATABASE_URL` is not provided in local development, backend automatically falls back to in-memory PostgreSQL (`pg-mem`) so the app can still boot for quick MVP testing.

## 3) Environment Setup

### Backend `.env`

Use `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@your-neon-host/dbname?sslmode=require
JWT_SECRET=change_this_to_a_long_random_secret
FRONTEND_URL=http://localhost:5173
SELF_PING_URL=
ENABLE_SAMPLE_SEED=false
```

Variable notes:

- `DATABASE_URL`: Neon connection string
- `JWT_SECRET`: long random secret
- `FRONTEND_URL`: allowed CORS origin(s), comma-separated supported
- `SELF_PING_URL`: Render app URL for anti-sleep in production
- `ENABLE_SAMPLE_SEED=true` to auto-load demo seed on startup

### Frontend env strategy

Static HTML cannot securely read build env at runtime without a build step.
Routix uses `frontend/js/runtime-config.js`:

```js
window.__ROUTIX_CONFIG__ = {
  API_URL: 'http://localhost:5000'
};
```

For production, set this file to your Render backend URL, e.g.:

```js
window.__ROUTIX_CONFIG__ = {
  API_URL: 'https://your-backend.onrender.com'
};
```

`frontend/.env.example` is included for reference only.

## 4) Neon Setup

1. Create project in Neon.
2. Copy connection string.
3. Put it in `backend/.env` as `DATABASE_URL`.
4. Run schema SQL in Neon editor or let backend auto-init on startup.

## 5) SQL Setup (Schema + Indexes + Seed)

Files:

- `backend/sql/schema.sql` - full tables/indexes
- `backend/sql/neon_setup.sql` - Neon SQL editor script
- `backend/sql/seed.sql` - sample seed

Tables:

- `users(id, email, password, created_at)`
- `links(id, user_id, code, target_url, created_at)`
- `clicks(id, link_id, ip, user_agent, referer, country, city, browser, os, device, language, created_at)`

Foreign keys:

- `links.user_id -> users.id ON DELETE CASCADE`
- `clicks.link_id -> links.id ON DELETE CASCADE`

Indexes included for performance on:

- links by `user_id`, `created_at`
- clicks by `link_id`, `created_at`, `ip`, `country`, `browser`, `os`

## 6) Auto Database Initialization

Backend runs auto initialization on startup:

- loads `backend/sql/schema.sql`
- optionally loads `backend/sql/seed.sql` if `ENABLE_SAMPLE_SEED=true`

Manual run:

```bash
npm run db:init --workspace backend
```

## 7) Render Deploy (Backend)

You can deploy with Blueprint using root `render.yaml` (or `backend/render.yaml`).

Steps:

1. Push repository to GitHub.
2. In Render -> New -> Blueprint.
3. Select repo.
4. Confirm service settings from `render.yaml`.
5. Add env vars in Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Netlify domain)
   - `SELF_PING_URL` (your Render backend URL)

## 8) Netlify Deploy (Frontend)

`frontend/netlify.toml` is ready.

Steps:

1. Create site from Git in Netlify.
2. Set publish directory to `frontend`.
3. No build command required for pure static deploy.
4. Ensure `frontend/js/runtime-config.js` contains production API URL.

## 9) Production Build Notes

- Frontend is static and does not require transpilation/build.
- Backend uses `npm start` on Render.
- CORS and security middleware already enabled.

## 10) Render Environment Variables

Required:

- `NODE_ENV=production`
- `PORT=10000` (Render default internal)
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL=https://your-frontend.netlify.app`
- `SELF_PING_URL=https://your-backend.onrender.com`

Optional:

- `ENABLE_SAMPLE_SEED=false`

## 11) Netlify Environment Variables

For this static architecture, API URL is read from `frontend/js/runtime-config.js`.
If you later add a build step/bundler, you can migrate to injected env vars.

## 12) How Self-Ping Works (Render Anti-Sleep)

Implemented in `backend/utils/keepAlive.js`.

- Runs only when `NODE_ENV=production`
- Every 120 seconds calls:
  - `GET {SELF_PING_URL}/health` (or `RENDER_EXTERNAL_URL` fallback)
- Keeps free-tier service warm while active

Health endpoint:

- `GET /health`

## 13) How Redirect Tracking Works

Flow for `GET /r/:code`:

1. Lookup link by code.
2. Collect request metadata:
   - IP
   - user-agent
   - referer
   - language
   - browser
   - OS
   - device
   - country/city (geo lookup with graceful fallback)
3. Insert row into `clicks`.
4. Redirect (`302`) to `target_url`.

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Links:

- `GET /api/links?page=1&limit=10&search=`
- `POST /api/links`
- `DELETE /api/links/:id`
- `GET /api/links/activity/recent`

Analytics:

- `GET /api/analytics/overview`

Redirect:

- `GET /r/:code`

## Security Implemented

- `helmet`
- `cors` origin allow-list
- `express-rate-limit` for API/auth/redirect
- JWT validation middleware
- `bcryptjs` hashing (bcrypt compatible)
- parameterized SQL queries (`pg`)
- input sanitization and URL validation

## Demo Seed Account

When `ENABLE_SAMPLE_SEED=true` and seed loaded:

- Email: `demo@routix.app`
- Password: `Demo12345!`

## Final Notes

After setting env values, the project should start directly with:

```bash
npm install
npm run dev
```

No additional code changes are required.
