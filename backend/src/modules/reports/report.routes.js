import { Router } from 'express';
import { ingestReport, reportar } from './report.controller.js';

const reportsRouter = Router();

reportsRouter.post('/ingest', ingestReport);
reportsRouter.post('/', reportar);

export default reportsRouter;
