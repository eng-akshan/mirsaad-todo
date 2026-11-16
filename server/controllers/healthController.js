import { prisma } from '../services/prisma.js';

export function health(req, res) {
  res.json({ status: 'ok' });
}

export async function databaseHealth(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'reachable' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
}
