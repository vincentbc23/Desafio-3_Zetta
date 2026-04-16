import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

const parsePort = (value) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 5000;
  }

  return parsed;
};

const parseFrontendUrls = (value) => {
  if (!value) {
    return [DEFAULT_FRONTEND_URL];
  }

  return value
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
};

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  frontendUrls: parseFrontendUrls(process.env.FRONTEND_URL),
};
