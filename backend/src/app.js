import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './shared/config/cors.js';
import { httpLogFormat } from './shared/config/logger.js';
import { API_PREFIX, JSON_BODY_LIMIT } from './shared/config/constants.js';
import routes from './routes/index.js';
import { notFound } from './shared/middlewares/notFound.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(morgan(httpLogFormat));

app.use(API_PREFIX, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
