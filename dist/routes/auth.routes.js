"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../auth/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtAuth_1 = require("../middleware/jwtAuth");
const router = (0, express_1.Router)();
// Helper to generate token
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwtAuth_1.JWT_SECRET, { expiresIn: '7d' });
};
// Google Auth
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), (req, res) => {
    const token = generateToken(req.user);
    // Return token to the client. Typically, this might be a redirect with a short-lived token in the URL.
    res.json({ token });
});
// Apple Auth
router.get('/apple', passport_1.default.authenticate('apple'));
router.post('/apple/callback', passport_1.default.authenticate('apple', { session: false }), (req, res) => {
    const token = generateToken(req.user);
    res.json({ token });
});
exports.default = router;
