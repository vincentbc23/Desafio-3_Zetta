import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { corsOptions } from './shared/config/cors.js';
import { httpLogFormat } from './shared/config/logger.js';
import { API_PREFIX, JSON_BODY_LIMIT } from './shared/config/constants.js';
import routes from './routes/index.js';
import { notFound } from './shared/middlewares/notFound.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chartDirectoryCandidates = [
	path.resolve(__dirname, '../graficos'),
	path.resolve(__dirname, '../../graficos'),
	path.resolve(process.cwd(), 'graficos'),
];

const chartsDirectory = chartDirectoryCandidates.find((dir) => fs.existsSync(dir)) || chartDirectoryCandidates[1];

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(morgan(httpLogFormat));

if (!fs.existsSync(chartsDirectory)) {
	console.warn(`[charts] directory not found: ${chartsDirectory}`);
}

app.use(`${API_PREFIX}/graficos`, express.static(chartsDirectory));

app.use(API_PREFIX, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
