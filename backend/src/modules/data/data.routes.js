import { Router } from 'express';
import { getCards, getDados, getOrgaosAnalytics } from './data.controller.js';
import { authenticateFirefighter, authorizeFirefighterRoles } from '../../shared/middlewares/auth.js';

const dataRouter = Router();

dataRouter.get('/cards', getCards);
dataRouter.get('/dados', getDados);
dataRouter.get('/orgaos/analytics', authenticateFirefighter, authorizeFirefighterRoles(['bombeiro']), getOrgaosAnalytics);

export default dataRouter;
