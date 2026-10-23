import { Router } from 'express';
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  exportGuestsCSV,
  generateInvitationDrafts,
} from '../controllers/guestController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createGuestSchema, updateGuestSchema } from '../validators/guestValidator.js';

const router = Router();

router.use(authenticate);

router.get('/:eventId', getGuests);
router.get('/:eventId/export-csv', exportGuestsCSV);
router.get('/:eventId/invitation-drafts', generateInvitationDrafts);
router.post('/', validateBody(createGuestSchema), createGuest);
router.patch('/:id', validateBody(updateGuestSchema), updateGuest);
router.delete('/:id', deleteGuest);

export default router;
