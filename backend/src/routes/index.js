import { Router } from 'express';
import healthRouter from '../modules/health/health.routes.js';
import reportsRouter from '../modules/reports/report.routes.js';
import mlRouter from '../modules/ml/ml.routes.js';

const router = Router();

router.use('/', healthRouter);
router.use('/reports', reportsRouter);
router.use('/ml', mlRouter);

export default router;
