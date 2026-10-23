import { Router } from 'express';
import {
  generatePlan,
  refinePlan,
  suggestIdeas,
  regenerateSection,
  getAIStatus,
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  generatePlanSchema,
  refinePlanSchema,
  suggestIdeasSchema,
  regenerateSectionSchema,
} from '../validators/aiValidator.js';

const router = Router();

// AI Status check (no auth required for initial handshake)
router.get('/status', getAIStatus);

// Generation endpoints protected by authentication & AI rate limiter
router.use(authenticate);
router.use(aiLimiter);

router.post('/generate-plan', validateBody(generatePlanSchema), generatePlan);
router.post('/refine-plan', validateBody(refinePlanSchema), refinePlan);
router.post('/suggest-ideas', validateBody(suggestIdeasSchema), suggestIdeas);
router.post('/regenerate-section', validateBody(regenerateSectionSchema), regenerateSection);

export default router;
