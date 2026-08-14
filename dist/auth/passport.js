"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_apple_1 = __importDefault(require("passport-apple"));
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Helper to find or create user
const findOrCreateUser = async (email) => {
    let result = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        result = await (0, db_1.query)('INSERT INTO users (email) VALUES ($1) RETURNING *', [email]);
    }
    return result.rows[0];
};
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        if (!email) {
            return done(new Error('No email found from Google profile'));
        }
        const user = await findOrCreateUser(email);
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
passport_1.default.use(new passport_apple_1.default({
    clientID: process.env.APPLE_CLIENT_ID || 'placeholder_apple_client_id',
    teamID: process.env.APPLE_TEAM_ID || 'placeholder_team_id',
    keyID: process.env.APPLE_KEY_ID || 'placeholder_key_id',
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION || '',
    callbackURL: '/auth/apple/callback',
}, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
        // Apple strategy provides email sometimes via idToken
        const email = profile?.email || idToken?.email;
        if (!email) {
            return done(new Error('No email found from Apple profile'));
        }
        const user = await findOrCreateUser(email);
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
exports.default = passport_1.default;
