import { env } from '../config/env.js';

// 1. Prepara as variáveis para enviar. 
// AVISO: Os nomes dessas chaves DEVEM ser idênticos às colunas que o modelo espera no features_fogo.pkl
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

const classifyRiskByFrp = (frpValue) => {
  if (!Number.isFinite(frpValue)) {
    return 'indefinido';
  }

  if (frpValue < 50) {
    return 'baixo';
  }

  if (frpValue <= 500) {
    return 'moderado';
  }

  return 'alto';
};

// 2. Mapeia a resposta da API Python para o formato que o Backend Node espera
const mapApiPrediction = (payload) => {

  const probIncendio = Number(payload?.prob_incendio || 0); // Se o modelo não tiver .predict_proba, pode ser 0
  const frpPrevisto = Number(payload?.frp_previsto || payload?.intensidade_frp);

  if (!Number.isFinite(frpPrevisto)) {
    throw new Error('A API de ML retornou um payload de predição inválido ou incompleto.');
  }

  const classePrevista = classifyRiskByFrp(frpPrevisto);

  return {

    modelName: payload?.debug_info?.modelo_classificador || 'api-cerrado-ml',
    modelVersion: '1.0.0',
    probIncendio,
    classePrevista,
    frpPrevisto,
    source: 'api',
  };
};

export const predictFireRisk = async (features) => {
  if (!env.mlEnabled) {
    throw new Error('A API de ML está desabilitada no .env (ML_ENABLED=false).');
  }

  const payload = getFeaturePayload(features);

  try {
    const response = await fetch(`${env.mlApiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Envia no formato {"dados": { ... }} conforme o BaseModel do FastAPI
      body: JSON.stringify({ dados: payload }), 
    });

    if (!response.ok) {
      // Captura o erro da API (ex: 422 Unprocessable Entity se faltar alguma variável)
      const errorText = await response.text();
      throw new Error(`Falha na API de ML (Status ${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return mapApiPrediction(result);
    
  } catch (error) {
    console.error('[ML Service] Erro de comunicação com a API de ML:', error.message);
    // Lança o erro para cima. Seu controller deve ter um try/catch para retornar 500 ao usuário
    throw error; 
  }
};

export const getMlStatus = () => ({
  enabled: env.mlEnabled,
  endpoint: env.mlApiUrl,
  strategy: env.mlEnabled ? 'external-api-only' : 'disabled',
  message: env.mlEnabled
    ? 'ML API habilitada e operando como fonte exclusiva de predições.'
    : 'ML API desabilitada. As predições não estão disponíveis.',
});