require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { initializeDatabase } = require('./utils/initDb');
const { startKeepAlive } = require('./utils/keepAlive');
const { apiLimiter } = require('./middleware/rateLimiters');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const redirectRoutes = require('./routes/redirectRoutes');
const healthRoutes = require('./routes/healthRoutes');

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  process.env.JWT_SECRET = 'dev_insecure_secret_change_me';
  console.warn('[Auth] JWT_SECRET is not set. Using insecure development fallback secret.');
}

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  console.warn('[DB] DATABASE_URL is not set. Running in local in-memory DB mode.');
}

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS blocked for this origin'));
    },
    credentials: false
  })
);

app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/r', redirectRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Routix backend running on port ${PORT}`);
    startKeepAlive();
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
