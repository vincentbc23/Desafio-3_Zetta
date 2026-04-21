import { Router } from 'express';
import { status } from './ml.controller.js';

const mlRouter = Router();

mlRouter.get('/status', status);

export default mlRouter;
