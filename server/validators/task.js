import { z } from 'zod';

const dueDate = z.union([z.iso.datetime(), z.literal(''), z.null()]).optional().transform((value) => value ? new Date(value) : null);

export const taskIdSchema = z.object({ id: z.uuid() });

export const taskQuerySchema = z.object({
  search: z.string().trim().max(200).optional().default(''),
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable().transform((value) => value || null),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate,
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable().transform((value) => value || null),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate,
});

export const statusSchema = z.object({ status: z.enum(['PENDING', 'COMPLETED']) });
