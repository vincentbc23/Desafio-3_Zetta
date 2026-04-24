import { Router } from 'express';
import healthRouter from '../modules/health/health.routes.js';
import reportsRouter from '../modules/reports/report.routes.js';
import mlRouter from '../modules/ml/ml.routes.js';
import dataRouter from '../modules/data/data.routes.js';
import authRouter from '../modules/auth/auth.routes.js';

const router = Router();

router.use('/', healthRouter);
router.use('/reports', reportsRouter);
router.use('/ml', mlRouter);
router.use('/', dataRouter);
router.use('/reportar', reportsRouter);
router.use('/', authRouter);

export default router;
