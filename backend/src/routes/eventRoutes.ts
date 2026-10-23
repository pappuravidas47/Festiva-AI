import { Router } from 'express';
import {
  createEvent,
  getMyEvents,
  getEventById,
  updateEvent,
  duplicateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createEventSchema, updateEventSchema } from '../validators/eventValidator.js';

const router = Router();

// All event routes are protected by authentication
router.use(authenticate);

router.post('/', validateBody(createEventSchema), createEvent);
router.get('/', getMyEvents);
router.get('/:id', getEventById);
router.patch('/:id', validateBody(updateEventSchema), updateEvent);
router.post('/:id/duplicate', duplicateEvent);
router.delete('/:id', deleteEvent);

export default router;
