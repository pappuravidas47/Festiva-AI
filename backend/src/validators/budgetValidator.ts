import { z } from 'zod';

export const createBudgetItemSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
  category: z.enum([
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Entertainment',
    'Invitations',
    'Transportation',
    'Gifts',
    'Miscellaneous',
    'Contingency',
  ]),
  description: z.string().min(1, 'Description is required').max(200),
  estimatedCost: z.number().min(0, 'Estimated cost cannot be negative'),
  actualCost: z.number().min(0, 'Actual cost cannot be negative').default(0),
  paidStatus: z.enum(['Unpaid', 'Partially Paid', 'Paid']).default('Unpaid'),
  dueDate: z.string().optional(),
  vendorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID').optional(),
  notes: z.string().optional().default(''),
});

export const updateBudgetItemSchema = createBudgetItemSchema.partial();

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>;
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>;
