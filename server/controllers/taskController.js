import { prisma } from '../services/prisma.js';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
};

export async function listTasks(req, res) {
  const { search, status, priority } = req.validatedQuery;
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: taskSelect,
    orderBy: [{ status: 'asc' }, { dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
  });
  res.json({ tasks });
}

export async function createTask(req, res) {
  const task = await prisma.task.create({
    data: { ...req.body, userId: req.userId },
    select: taskSelect,
  });
  res.status(201).json({ task });
}

export async function getTask(req, res) {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.userId },
    select: taskSelect,
  });
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  return res.json({ task });
}

export async function updateTask(req, res) {
  const result = await prisma.task.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: req.body,
  });
  if (!result.count) return res.status(404).json({ error: 'Task not found.' });
  const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: taskSelect });
  return res.json({ task });
}

export async function updateStatus(req, res) {
  const result = await prisma.task.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { status: req.body.status },
  });
  if (!result.count) return res.status(404).json({ error: 'Task not found.' });
  const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: taskSelect });
  return res.json({ task });
}

export async function deleteTask(req, res) {
  const result = await prisma.task.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  if (!result.count) return res.status(404).json({ error: 'Task not found.' });
  return res.status(204).end();
}
