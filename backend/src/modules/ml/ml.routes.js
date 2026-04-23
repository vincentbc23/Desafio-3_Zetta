import { Router } from 'express';
// Importa o controller que criamos no passo anterior
import * as mlController from './ml.controller.js'; // Ajuste o caminho se o controller estiver em outra pasta

const mlRouter = Router();

// Define a rota de health check (ficará acessível em GET /ml/status)
mlRouter.get('/status', mlController.status);

// Define a rota de predição (ficará acessível em POST /ml/predict)
mlRouter.post('/predict', mlController.predict);

export default mlRouter;