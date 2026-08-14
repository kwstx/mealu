import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

// Helper to find or create user
const findOrCreateUser = async (email: string) => {
  let result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    result = await query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *',
      [email]
    );
  }
  return result.rows[0];
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('No email found from Google profile'));
        }
        const user = await findOrCreateUser(email);
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID || 'placeholder_apple_client_id',
      teamID: process.env.APPLE_TEAM_ID || 'placeholder_team_id',
      keyID: process.env.APPLE_KEY_ID || 'placeholder_key_id',
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION || '',
      callbackURL: '/auth/apple/callback',
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Apple strategy provides email sometimes via idToken
        const email = profile?.email || (idToken as any)?.email;
        if (!email) {
           return done(new Error('No email found from Apple profile'));
        }
        const user = await findOrCreateUser(email);
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;
