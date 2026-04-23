import { Router } from 'express';
import { getCards, getDados } from './data.controller.js';

const dataRouter = Router();

dataRouter.get('/cards', getCards);
dataRouter.get('/dados', getDados);

export default dataRouter;
