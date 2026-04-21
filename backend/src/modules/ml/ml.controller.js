import { getMlStatus } from '../../shared/services/ml.service.js';

export const status = (_req, res) => {
  res.status(200).json({
    ok: true,
    ml: getMlStatus(),
    timestamp: new Date().toISOString(),
  });
};
