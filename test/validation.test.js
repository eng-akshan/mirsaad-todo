import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, registerSchema } from '../server/validators/auth.js';
import { createTaskSchema, statusSchema, taskQuerySchema } from '../server/validators/task.js';
import { validate } from '../server/middleware/validate.js';

test('registration normalizes email and enforces password strength', () => {
  const valid = registerSchema.parse({ name: '  Mir Saad  ', email: ' USER@Example.COM ', password: 'focus123' });
  assert.equal(valid.name, 'Mir Saad');
  assert.equal(valid.email, 'user@example.com');
  assert.equal(registerSchema.safeParse({ name: 'M', email: 'bad', password: 'short' }).success, false);
  assert.equal(loginSchema.safeParse({ email: 'user@example.com', password: 'x' }).success, true);
});

test('task input validates enums and converts ISO due dates', () => {
  const task = createTaskSchema.parse({
    title: '  Ship MIRSAAD  ',
    description: '',
    priority: 'HIGH',
    dueDate: '2026-11-16T12:00:00.000Z',
  });
  assert.equal(task.title, 'Ship MIRSAAD');
  assert.equal(task.description, null);
  assert.equal(task.priority, 'HIGH');
  assert.ok(task.dueDate instanceof Date);
  assert.equal(statusSchema.safeParse({ status: 'ARCHIVED' }).success, false);
});

test('task filters reject unexpected values', () => {
  assert.equal(taskQuerySchema.safeParse({ search: 'focus', status: 'PENDING' }).success, true);
  assert.equal(taskQuerySchema.safeParse({ priority: 'URGENT' }).success, false);
});

test('query validation supports the read-only Express 5 query getter', () => {
  const request = {};
  Object.defineProperty(request, 'query', {
    get: () => ({ search: '  focus  ', status: 'PENDING' }),
  });
  let continued = false;
  validate(taskQuerySchema, 'query')(request, {}, () => { continued = true; });
  assert.equal(continued, true);
  assert.deepEqual(request.validatedQuery, { search: 'focus', status: 'PENDING' });
});
