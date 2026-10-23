import { Router } from 'express';
import {
  getBudgetSummary,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
} from '../controllers/budgetController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  createBudgetItemSchema,
  updateBudgetItemSchema,
} from '../validators/budgetValidator.js';

const router = Router();

router.use(authenticate);

router.get('/:eventId', getBudgetSummary);
router.post('/', validateBody(createBudgetItemSchema), addBudgetItem);
router.patch('/:id', validateBody(updateBudgetItemSchema), updateBudgetItem);
router.delete('/:id', deleteBudgetItem);

export default router;
