import { env } from './env.js';

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;

const normalizedAllowedOrigins = new Set(env.frontendUrls.map((origin) => origin.trim().toLowerCase()));

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.trim().toLowerCase();

  if (normalizedAllowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  return localhostPattern.test(normalizedOrigin);
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin || 'unknown'} is not allowed by CORS`));
  },
  credentials: true,
};
