import { z } from 'zod';

export const generatePlanSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
});

export const refinePlanSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
  instruction: z.string().min(3, 'Instruction must be at least 3 characters').max(500),
});

export const suggestIdeasSchema = z.object({
  eventType: z.string().min(2),
  budget: z.number().min(0).optional(),
  guestCount: z.number().min(1).optional(),
  city: z.string().optional(),
  theme: z.string().optional(),
  prompt: z.string().min(3).max(500),
});

export const regenerateSectionSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
  section: z.enum([
    'themeConcept',
    'venueRecommendations',
    'decorations',
    'cateringMenu',
    'budgetBreakdown',
    'vendorChecklist',
    'preparationTimeline',
    'dayOfSchedule',
    'invitationWording',
    'entertainment',
    'budgetSavingAlternatives',
    'premiumUpgrades',
  ]),
  notes: z.string().optional(),
});

export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
export type RefinePlanInput = z.infer<typeof refinePlanSchema>;
export type SuggestIdeasInput = z.infer<typeof suggestIdeasSchema>;
export type RegenerateSectionInput = z.infer<typeof regenerateSectionSchema>;
