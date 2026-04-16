import { env } from './env.js';

export const httpLogFormat = env.isDevelopment ? 'dev' : 'combined';
