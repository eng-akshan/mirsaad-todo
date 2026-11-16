import { app } from './app.js';
import { config } from './services/config.js';
import { prisma } from './services/prisma.js';

const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`MIRSAAD TODO listening on 0.0.0.0:${config.PORT}`);
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down gracefully.`);

  server.close(async (error) => {
    await prisma.$disconnect();
    if (error) {
      console.error(error);
      process.exit(1);
    }
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
