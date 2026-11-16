import { Prisma } from '@prisma/client';

export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Invalid request data.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'An unexpected error occurred.' });
}
