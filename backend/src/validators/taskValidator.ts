import { z } from 'zod';

export const createTaskSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID'),
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional().default(''),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid due date is required',
  }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  category: z
    .enum([
      'Venue',
      'Catering',
      'Decoration',
      'Invitations',
      'Vendors',
      'Entertainment',
      'Final Preparation',
    ])
    .default('Final Preparation'),
  status: z.enum(['Pending', 'In Progress', 'Completed']).default('Pending'),
  assignedTo: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
