import { Router } from 'express';
import { getCurrentFirefighter, loginFirefighter, logoutFirefighter } from './auth.controller.js';

const authRouter = Router();

authRouter.post('/auth/login', loginFirefighter);
authRouter.get('/auth/me', getCurrentFirefighter);
authRouter.post('/auth/logout', logoutFirefighter);

export default authRouter;