import app from './app.js';
import { env } from './shared/config/env.js';

const server = app.listen(env.port, () => {
  console.log(`🚀 Backend running on http://localhost:${env.port}`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing backend server...`);

  server.close(() => {
    console.log('Backend server stopped.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
