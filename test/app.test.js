import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:password@127.0.0.1:5432/postgres?schema=mirsaad_todo';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.APP_URL = 'http://localhost:3000';
process.env.COOKIE_SECURE = 'false';

const { app } = await import('../server/app.js');
const { prisma } = await import('../server/services/prisma.js');

test('health endpoint responds without exposing internals', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });

  const missing = await fetch(`http://127.0.0.1:${port}/api/not-a-route`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Route not found.' });
});
