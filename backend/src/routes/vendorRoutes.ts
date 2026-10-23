import { Router } from 'express';
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorAIQuestions,
} from '../controllers/vendorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createVendorSchema, updateVendorSchema } from '../validators/vendorValidator.js';

const router = Router();

router.use(authenticate);

router.get('/questions', getVendorAIQuestions);
router.get('/:eventId', getVendors);
router.post('/', validateBody(createVendorSchema), createVendor);
router.patch('/:id', validateBody(updateVendorSchema), updateVendor);
router.delete('/:id', deleteVendor);

export default router;
