import { prisma } from '../services/prisma.js';

export async function stats(req, res) {
  const [total, completed, overdue] = await prisma.$transaction([
    prisma.task.count({ where: { userId: req.userId } }),
    prisma.task.count({ where: { userId: req.userId, status: 'COMPLETED' } }),
    prisma.task.count({
      where: { userId: req.userId, status: 'PENDING', dueDate: { lt: new Date() } },
    }),
  ]);
  const pending = total - completed;
  res.json({
    stats: {
      total,
      completed,
      pending,
      overdue,
      completionPercentage: total ? Math.round((completed / total) * 100) : 0,
    },
  });
}
