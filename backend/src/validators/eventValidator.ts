import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters').max(120),
  eventType: z.enum([
    'Wedding',
    'Birthday',
    'Community Event',
    'Anniversary',
    'Graduation',
    'Baby Shower',
    'Festival',
    'Custom Event',
  ]),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date is required',
  }),
  startTime: z.string().optional().default('18:00'),
  endTime: z.string().optional().default('23:00'),
  city: z.string().min(2, 'City is required'),
  location: z.string().optional().default(''),
  budget: z.number().min(0, 'Budget cannot be negative').default(50000),
  currency: z.string().default('₹'),
  guestCount: z.number().min(1, 'Expected guest count must be at least 1').default(50),
  indoorOutdoor: z.enum(['Indoor', 'Outdoor', 'Hybrid', 'Flexible']).default('Indoor'),
  theme: z.string().optional().default(''),
  preferredColors: z.array(z.string()).default(['#6366F1', '#EC4899', '#F59E0B']),
  culturalPreferences: z.string().optional().default(''),
  dietaryRequirements: z.array(z.string()).default([]),
  priorities: z.array(z.string()).default(['Venue', 'Catering', 'Photography']),
  additionalNotes: z.string().optional().default(''),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z
    .enum(['Planning', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'])
    .optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
