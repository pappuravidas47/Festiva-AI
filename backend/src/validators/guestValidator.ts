import { z } from 'zod';

export const createGuestSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
  name: z.string().min(1, 'Guest name is required').max(100),
  email: z.string().email().or(z.string().length(0)).optional().default(''),
  phone: z.string().optional().default(''),
  group: z
    .enum(['Family', 'Friends', 'Colleagues', 'VIP', 'Neighbors', 'Other'])
    .default('Friends'),
  rsvpStatus: z.enum(['Pending', 'Attending', 'Not Attending']).default('Pending'),
  plusOnes: z.number().min(0, 'Plus ones cannot be negative').default(0),
  dietaryRequirements: z.array(z.string()).default([]),
  tableNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const updateGuestSchema = createGuestSchema.partial().extend({
  invitationSent: z.boolean().optional(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
