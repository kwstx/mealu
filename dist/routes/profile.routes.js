"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuth_1 = require("../middleware/jwtAuth");
const profile_service_1 = require("../services/profile.service");
const profile_schema_1 = require("../schemas/profile.schema");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Get Current Profile
router.get('/', jwtAuth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profile_service_1.ProfileService.getProfile(userId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Update Profile
router.put('/', jwtAuth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        // Validate request body
        const validatedData = profile_schema_1.ProfileSchema.parse(req.body);
        // Update profile
        const updatedProfile = await profile_service_1.ProfileService.updateProfile(userId, validatedData);
        res.json(updatedProfile);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
