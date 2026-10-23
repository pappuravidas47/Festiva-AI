import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  autoGenerateMilestones,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator.js';

const router = Router();

router.use(authenticate);

router.get('/:eventId', getTasks);
router.post('/', validateBody(createTaskSchema), createTask);
router.post('/:eventId/auto-milestones', autoGenerateMilestones);
router.patch('/:id', validateBody(updateTaskSchema), updateTask);
router.patch('/:id/toggle', toggleTaskCompletion);
router.delete('/:id', deleteTask);

export default router;
