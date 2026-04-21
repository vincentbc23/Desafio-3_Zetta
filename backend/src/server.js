import app from './app.js';
import { env } from './shared/config/env.js';
import { initializeDatabase } from './shared/db/schema.js';

const startServer = async () => {
  await initializeDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
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
};

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
