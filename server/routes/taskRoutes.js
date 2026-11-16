import { Router } from 'express';
import { createTask, deleteTask, getTask, listTasks, updateStatus, updateTask } from '../controllers/taskController.js';
import { csrfProtection } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, statusSchema, taskIdSchema, taskQuerySchema, updateTaskSchema } from '../validators/task.js';

const router = Router();

router.get('/', validate(taskQuerySchema, 'query'), listTasks);
router.post('/', csrfProtection, validate(createTaskSchema), createTask);
router.get('/:id', validate(taskIdSchema, 'params'), getTask);
router.put('/:id', csrfProtection, validate(taskIdSchema, 'params'), validate(updateTaskSchema), updateTask);
router.patch('/:id/status', csrfProtection, validate(taskIdSchema, 'params'), validate(statusSchema), updateStatus);
router.delete('/:id', csrfProtection, validate(taskIdSchema, 'params'), deleteTask);

export default router;
