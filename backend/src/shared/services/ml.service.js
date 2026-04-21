import { env } from '../config/env.js';

export const getMlStatus = () => ({
  enabled: env.mlEnabled,
  endpoint: env.mlApiUrl,
  strategy: 'placeholder-only',
  message:
    'ML API is not active yet. The ingestion pipeline already stores all model features and leaves prediction fields ready.',
});
