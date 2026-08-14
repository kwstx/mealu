"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSchema = void 0;
const zod_1 = require("zod");
const dietVocabulary = [
    'vegan',
    'vegetarian',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'paleo',
    'keto',
    'pescatarian',
];
exports.ProfileSchema = zod_1.z.object({
    household_size: zod_1.z.number().int().min(1, 'Household size must be at least 1'),
    weekly_budget: zod_1.z.number().min(0.01, 'Budget must be positive'),
    currency: zod_1.z.string().length(3).optional().default('USD'),
    preferred_store_id: zod_1.z.string().uuid().optional().nullable(),
    diet_constraints: zod_1.z.array(zod_1.z.enum(dietVocabulary)).optional().default([]),
    flexible_preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().default({}),
});
