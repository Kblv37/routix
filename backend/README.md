# Routix Backend

Express + PostgreSQL API for auth, tracking links, redirect logging, and analytics.

## Scripts

- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm run db:init` - Run SQL initialization manually

## Environment Variables

See `.env.example`.

If `DATABASE_URL` is missing in local mode, backend uses in-memory PostgreSQL (`pg-mem`) fallback.

## API Base

- Local: `http://localhost:5000`

## Health Check

- `GET /health`

## Key Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/links`
- `POST /api/links`
- `DELETE /api/links/:id`
- `GET /api/links/activity/recent`
- `GET /api/analytics/overview`
- `GET /r/:code`
