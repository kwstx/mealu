import { z } from 'zod';

const dietVocabulary = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'paleo',
  'keto',
  'pescatarian',
] as const;

export const ProfileSchema = z.object({
  household_size: z.number().int().min(1, 'Household size must be at least 1'),
  weekly_budget: z.number().min(0.01, 'Budget must be positive'),
  currency: z.string().length(3).optional().default('USD'),
  preferred_store_id: z.string().uuid().optional().nullable(),
  diet_constraints: z.array(z.enum(dietVocabulary)).optional().default([]),
  flexible_preferences: z.record(z.string(), z.any()).optional().default({}),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
