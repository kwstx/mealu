"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const db_1 = require("../db");
const DIET_BIT_MAP = {
    'vegan': 1n << 0n,
    'vegetarian': 1n << 1n,
    'gluten-free': 1n << 2n,
    'dairy-free': 1n << 3n,
    'nut-free': 1n << 4n,
    'paleo': 1n << 5n,
    'keto': 1n << 6n,
    'pescatarian': 1n << 7n,
};
class ProfileService {
    static computePreferenceBitmap(dietConstraints) {
        let bitmap = 0n;
        for (const tag of dietConstraints) {
            if (DIET_BIT_MAP[tag]) {
                bitmap |= DIET_BIT_MAP[tag];
            }
        }
        return bitmap;
    }
    static async getProfile(userId) {
        const result = await (0, db_1.query)(`SELECT id, email, household_size, weekly_budget, currency, preferred_store_id, diet_constraints, flexible_preferences, preference_bitmap, created_at, updated_at
       FROM users WHERE id = $1`, [userId]);
        return result.rows[0];
    }
    static async updateProfile(userId, data) {
        const bitmap = this.computePreferenceBitmap(data.diet_constraints);
        const result = await (0, db_1.query)(`UPDATE users
       SET household_size = $1,
           weekly_budget = $2,
           currency = $3,
           preferred_store_id = $4,
           diet_constraints = $5,
           flexible_preferences = $6,
           preference_bitmap = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, email, household_size, weekly_budget, currency, preferred_store_id, diet_constraints, flexible_preferences, preference_bitmap`, [
            data.household_size,
            data.weekly_budget,
            data.currency,
            data.preferred_store_id,
            data.diet_constraints,
            data.flexible_preferences,
            bitmap.toString(), // Ensure BIGINT is passed as string to pg
            userId
        ]);
        return result.rows[0];
    }
}
exports.ProfileService = ProfileService;
