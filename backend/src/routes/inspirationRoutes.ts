import { Router } from 'express';
import {
  getInspirations,
  toggleFavorite,
  applyToEvent,
} from '../controllers/inspirationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Publicly viewable inspirations gallery
router.get('/', getInspirations);

// Protected actions: favoriting and applying to an event
router.post('/:id/favorite', authenticate, toggleFavorite);
router.post('/apply-to-event', authenticate, applyToEvent);

export default router;
