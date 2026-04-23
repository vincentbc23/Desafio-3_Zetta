import { query } from './client.js';

const schemaSql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  accuracy_meters DOUBLE PRECISION,
  location_source TEXT NOT NULL DEFAULT 'gps',
  location_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  description TEXT,
  dia_sem_chuva SMALLINT NOT NULL CHECK (dia_sem_chuva BETWEEN 0 AND 15),
  precipitacao DOUBLE PRECISION NOT NULL,
  temperatura_c DOUBLE PRECISION NOT NULL,
  umidade_relativa_pct DOUBLE PRECISION NOT NULL,
  vento_ms DOUBLE PRECISION NOT NULL,
  mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  hora SMALLINT NOT NULL CHECK (hora BETWEEN 0 AND 23),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  weather_provider TEXT NOT NULL,
  weather_collected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  prob_incendio DOUBLE PRECISION,
  classe_prevista TEXT,
  frp_previsto DOUBLE PRECISION,
  payload_used JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_features_report_id ON weather_features(report_id);
CREATE INDEX IF NOT EXISTS idx_predictions_report_id_created_at ON predictions(report_id, created_at DESC);
`;

const migrationsSql = `
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS accuracy_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_source TEXT NOT NULL DEFAULT 'gps',
  ADD COLUMN IF NOT EXISTS location_confirmed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE weather_features
  ADD COLUMN IF NOT EXISTS description TEXT;
`;

export const initializeDatabase = async () => {
  await query(schemaSql);
  await query(migrationsSql);
};
