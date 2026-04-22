import { env } from '../config/env.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const computeLocalPrediction = (features) => {
  const dryDaysRisk = clamp(Number(features.DiaSemChuva || 0) / 15, 0, 1);
  const tempRisk = clamp((Number(features.Temperatura_C || 0) - 20) / 20, 0, 1);
  const windRisk = clamp(Number(features.Vento_ms || 0) / 20, 0, 1);
  const humidityProtection = clamp(Number(features.Umidade_Relativa_pct || 0) / 100, 0, 1);
  const rainProtection = clamp(Number(features.Precipitacao || 0) / 15, 0, 1);

  const probabilityRaw =
    dryDaysRisk * 0.35 +
    tempRisk * 0.25 +
    windRisk * 0.2 +
    (1 - humidityProtection) * 0.15 +
    (1 - rainProtection) * 0.05;

  const probIncendio = clamp(Number(probabilityRaw.toFixed(4)), 0, 1);
  const classePrevista = probIncendio >= 0.7 ? 'alto' : probIncendio >= 0.4 ? 'medio' : 'baixo';
  const frpPrevisto = Number((probIncendio * 120).toFixed(2));

  return {
    modelName: 'local-risk-heuristic',
    modelVersion: '1.0.0',
    probIncendio,
    classePrevista,
    frpPrevisto,
    source: 'local',
  };
};

const mapApiPrediction = (payload) => {
  const probIncendio = Number(payload?.prob_incendio);
  const classePrevista = payload?.classe_prevista;
  const frpPrevisto = Number(payload?.frp_previsto);

  if (!Number.isFinite(probIncendio) || !classePrevista || !Number.isFinite(frpPrevisto)) {
    throw new Error('ML API returned an invalid prediction payload');
  }

  return {
    modelName: payload?.model_name || 'external-ml-api',
    modelVersion: payload?.model_version || 'unknown',
    probIncendio,
    classePrevista: String(classePrevista),
    frpPrevisto,
    source: 'api',
  };
};

const getFeaturePayload = (features) => ({
  DiaSemChuva: Number(features.DiaSemChuva),
  Precipitacao: Number(features.Precipitacao),
  Temperatura_C: Number(features.Temperatura_C),
  Umidade_Relativa_pct: Number(features.Umidade_Relativa_pct),
  Vento_ms: Number(features.Vento_ms),
  Mes: Number(features.Mes),
  Hora: Number(features.Hora),
  Latitude: Number(features.Latitude),
  Longitude: Number(features.Longitude),
});

export const predictFireRisk = async (features) => {
  const payload = getFeaturePayload(features);

  if (!env.mlEnabled) {
    return computeLocalPrediction(payload);
  }

  try {
    const response = await fetch(`${env.mlApiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ML API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return mapApiPrediction(result);
  } catch (_error) {
    return computeLocalPrediction(payload);
  }
};

export const getMlStatus = () => ({
  enabled: env.mlEnabled,
  endpoint: env.mlApiUrl,
  strategy: env.mlEnabled ? 'external-with-local-fallback' : 'local-fallback-only',
  message: env.mlEnabled
    ? 'ML API habilitada com fallback local em caso de falha.'
    : 'ML API desabilitada. Predicao local em uso para manter o pipeline funcional.',
});
