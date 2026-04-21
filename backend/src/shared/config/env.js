import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_DATABASE_URL = 'postgresql://zetta:zetta123@localhost:5432/zetta_db';
const DEFAULT_WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const DEFAULT_WEATHER_ARCHIVE_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const DEFAULT_ML_API_URL = 'http://ml-api:8000';

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

const parseBoolean = (value, fallback = false) => {
  if (value == null) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  frontendUrls: parseFrontendUrls(process.env.FRONTEND_URL),
  databaseUrl: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  weatherApiBaseUrl: process.env.WEATHER_API_BASE_URL || DEFAULT_WEATHER_API_BASE_URL,
  weatherArchiveBaseUrl: process.env.WEATHER_ARCHIVE_BASE_URL || DEFAULT_WEATHER_ARCHIVE_BASE_URL,
  mlApiUrl: process.env.ML_API_URL || DEFAULT_ML_API_URL,
  mlEnabled: parseBoolean(process.env.ML_ENABLED, false),
};
