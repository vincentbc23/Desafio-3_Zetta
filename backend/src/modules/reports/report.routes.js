import { Router } from 'express';
import { ingestReport } from './report.controller.js';

const reportsRouter = Router();

reportsRouter.post('/ingest', ingestReport);

export default reportsRouter;
