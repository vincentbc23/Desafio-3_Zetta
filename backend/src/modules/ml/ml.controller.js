import { getMlStatus, predictFireRisk } from '../../shared/services/ml.service.js';

// Rota 1: Verifica o status da API (Health Check)
export const status = (_req, res) => {
  res.status(200).json({
    ok: true,
    ml: getMlStatus(),
    timestamp: new Date().toISOString(),
  });
};

// Rota 2: Processa a predição de risco de incêndio
export const predict = async (req, res) => {
  try {
    // Repassa os dados enviados pelo front/usuário para o service
    const predictionResult = await predictFireRisk(req.body);
    
    return res.status(200).json({
      ok: true,
      data: predictionResult
    });

  } catch (error) {
    console.error('[Prediction Controller] Erro:', error.message);
    
    // Retorna 503 (Service Unavailable) se o Python estiver offline ou der erro
    return res.status(503).json({
      ok: false,
      error: "Serviço de predição temporariamente indisponível ou desativado.",
      details: error.message
    });
  }
};