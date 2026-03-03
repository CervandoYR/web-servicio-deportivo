import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().transform(v => new Date(v)),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  notes: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const assignGroupSchema = z.object({
  groupId: z.string(),
  startDate: z.string().transform(v => new Date(v)).optional(),
});
