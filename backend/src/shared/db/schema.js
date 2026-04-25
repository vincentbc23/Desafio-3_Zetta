import { query } from './client.js';
import { createPasswordDigest } from '../services/auth.service.js';

const DEFAULT_FIREFIGHTER_EMAIL = 'bombeiro@alertafogo.gov.br';
const DEFAULT_FIREFIGHTER_PASSWORD = 'Bombeiro@123';
const DEFAULT_FIREFIGHTER_NAME = 'Corpo de Bombeiros';

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
  regiao_mg TEXT,
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

CREATE TABLE IF NOT EXISTS firefighters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'bombeiro',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firefighter_id UUID NOT NULL REFERENCES firefighters(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_features_report_id ON weather_features(report_id);
CREATE INDEX IF NOT EXISTS idx_predictions_report_id_created_at ON predictions(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_firefighters_email ON firefighters(email);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token);
`;

const migrationsSql = `
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS accuracy_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_source TEXT NOT NULL DEFAULT 'gps',
  ADD COLUMN IF NOT EXISTS location_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS regiao_mg TEXT;

CREATE INDEX IF NOT EXISTS idx_reports_regiao_mg ON reports(regiao_mg);

UPDATE reports
SET regiao_mg = CASE
  WHEN latitude IS NULL OR longitude IS NULL THEN 'Não classificada'
  WHEN latitude < -22.95 OR latitude > -14.1 OR longitude < -51.3 OR longitude > -39.7 THEN 'Fora de Minas Gerais'
  WHEN latitude <= -21.2 AND longitude < -44.8 THEN 'Sul/Sudoeste de Minas'
  WHEN latitude <= -21.2 AND longitude >= -44.8 THEN 'Zona da Mata/Campo das Vertentes'
  WHEN latitude > -19.6 AND longitude <= -47.0 THEN 'Triângulo Mineiro/Alto Paranaíba'
  WHEN latitude > -18.2 AND longitude <= -45.3 THEN 'Noroeste de Minas'
  WHEN latitude > -18.2 AND longitude > -45.3 THEN 'Norte de Minas'
  WHEN latitude > -20.4 AND latitude <= -18.2 AND longitude > -44.0 THEN 'Vale do Jequitinhonha/Mucuri'
  WHEN latitude > -20.4 AND latitude <= -18.2 AND longitude <= -44.0 THEN 'Central Mineira'
  WHEN latitude <= -20.4 AND longitude <= -45.0 THEN 'Oeste de Minas'
  WHEN latitude <= -20.4 AND longitude > -45.0 AND longitude <= -43.5 THEN 'Região Metropolitana de BH'
  ELSE 'Zona da Mata/Campo das Vertentes'
END
WHERE regiao_mg IS NULL;

ALTER TABLE weather_features
  ADD COLUMN IF NOT EXISTS description TEXT;
`;

const seedAuthData = async () => {
  const result = await query(`SELECT COUNT(*)::int AS total FROM firefighters`);
  const totalFirefighters = Number(result.rows[0]?.total || 0);

  if (totalFirefighters > 0) {
    return;
  }

  const { salt, hash } = createPasswordDigest(DEFAULT_FIREFIGHTER_PASSWORD);

  await query(
    `
      INSERT INTO firefighters (name, email, password_salt, password_hash, role, active)
      VALUES ($1, $2, $3, $4, 'bombeiro', TRUE)
    `,
    [DEFAULT_FIREFIGHTER_NAME, DEFAULT_FIREFIGHTER_EMAIL, salt, hash]
  );
};

export const initializeDatabase = async () => {
  await query(schemaSql);
  await query(migrationsSql);
  await seedAuthData();
};
