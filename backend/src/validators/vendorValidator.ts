import { z } from 'zod';

export const createVendorSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
  name: z.string().min(1, 'Vendor name is required').max(120),
  category: z.enum([
    'Venue',
    'Caterer',
    'Decorator',
    'Photographer',
    'Entertainment',
    'Transport',
    'Other',
  ]),
  contactName: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email().or(z.string().length(0)).optional().default(''),
  address: z.string().optional().default(''),
  quotedPrice: z.number().min(0, 'Quoted price cannot be negative').default(0),
  finalPrice: z.number().min(0, 'Final price cannot be negative').default(0),
  bookingStatus: z
    .enum([
      'To Contact',
      'Contacted',
      'Quotation Received',
      'Shortlisted',
      'Booked',
      'Cancelled',
    ])
    .default('To Contact'),
  notes: z.string().optional().default(''),
  rating: z.number().min(1).max(5).optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
