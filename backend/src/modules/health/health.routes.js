import { Router } from 'express';
import { getHealth } from './health.controller.js';

const healthRouter = Router();

healthRouter.get('/health', getHealth);

export default healthRouter;
