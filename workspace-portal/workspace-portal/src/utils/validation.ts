import { z } from 'zod/v3';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(4, 'Password must be at least 4 characters'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(['super_admin', 'project_manager', 'team_lead', 'team_member', 'viewer'], {
    required_error: 'Please select a role',
  }),
  department: z.string().min(2, 'Department is required').max(50, 'Department name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  ownerId: z.string().min(1, 'Please select an owner'),
  status: z.enum(['active', 'planning', 'on_hold', 'completed', 'cancelled'], {
    required_error: 'Please select a status',
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Please select a priority',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  tags: z.string().optional(),
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return new Date(data.dueDate) >= new Date(data.startDate);
  }
  return true;
}, { message: 'Due date must be after start date', path: ['dueDate'] });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
