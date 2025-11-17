// src/routes/auth/oauth.route.ts
import { Router } from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { pool } from '../../db/pool.js';
import { signRefresh } from '../../utils/jwt.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import { ulid } from 'ulid';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { UserAuthData } from '@milemoto/types';
import {
  safeNext,
  verifyState,
  signState,
  validateTrustedCookie,
  ttlForRole,
  setRefreshCookie,
} from './auth.helpers.js';
import { sha256 } from '../../utils/crypto.js';
import { dbNow } from '../../db/time.js';
import { OAuth2Client } from 'google-auth-library';

export const oauthAuth = Router();
const oauthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function buildOAuthRedirect(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.length) {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return `${env.FRONTEND_BASE_URL}/oauth/google${query ? `?${query}` : ''}`;
}

oauthAuth.get('/google/start', (req, res) => {
  const next = safeNext(req.query.next);
  const remember = String(req.query.remember) === '1' || String(req.query.remember) === 'true';
  const nonce = crypto.randomBytes(16).toString('base64url');
  const state = signState({ next, remember, nonce });

  const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('nonce', nonce);

  return res.redirect(url.toString());
});

oauthAuth.get('/google/callback', async (req, res, next) => {
  try {
    const code = String(req.query.code || '');
    const stateStr = String(req.query.state || '');
    const state = verifyState(stateStr);
    if (!code || !state) return res.status(400).send('Invalid OAuth state');

    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

    // Exchange code
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) return res.status(400).send('Token exchange failed');
    const tok = (await tokenRes.json()) as { id_token?: string };
    if (!tok.id_token) return res.status(400).send('No id_token');

    const ticket = await oauthClient.verifyIdToken({
      idToken: tok.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const info = ticket.getPayload();
    if (!info || !info.sub) return res.status(400).send('Invalid id_token payload');
    if (!info.nonce || info.nonce !== state.nonce) return res.status(400).send('Nonce mismatch');
    if (info.email_verified !== true) return res.status(400).send('Email not verified');

    const gsub = info.sub;
    const emailRaw = info.email ?? '';
    if (!emailRaw) return res.status(400).send('Google account missing email');
    const email = emailRaw.toLowerCase();

    const nameStr = (info.name?.trim() ||
      `${info.given_name ?? ''} ${info.family_name ?? ''}`.trim() ||
      email.split('@')[0]) as string;

    // Link or create user
    const [bySubRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, full_name, email, phone, role, status, mfa_enabled, email_verified_at
       FROM users WHERE google_sub = ? LIMIT 1`,
      [gsub]
    );
    let u = bySubRows[0] as UserAuthData | undefined;

    if (!u && email) {
      // by email:
      const [byEmailRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, full_name, email, phone, role, status, google_sub, mfa_enabled, email_verified_at
         FROM users WHERE email = ? LIMIT 1`,
        [email]
      );
      const existing = byEmailRows[0] as UserAuthData | undefined;
      if (existing) {
        await pool.query(
          `UPDATE users
           SET google_sub = ?, email_verified_at = IFNULL(email_verified_at, ?)
           WHERE id = ?`,
          [gsub, info.email_verified ? new Date() : null, existing.id]
        );
        u = {
          ...existing,
          google_sub: gsub,
          email_verified_at:
            existing.email_verified_at ?? (info.email_verified ? new Date() : null),
        } as UserAuthData;
      }
    }

    if (!u) {
      // Create user
      const randomPw = crypto.randomBytes(16).toString('hex');
      const hash = await argon2.hash(randomPw, { type: argon2.argon2id });
      const [ins] = await pool.query<ResultSetHeader>(
        `INSERT INTO users (full_name, email, password_hash, role, status, email_verified_at, google_sub)
         VALUES (?, ?, ?, 'user', 'active', ?, ?)`,
        [nameStr, email, hash, info.email_verified ? new Date() : null, gsub]
      );
      const userId = String(ins.insertId);
      u = {
        id: userId,
        full_name: nameStr,
        email,
        phone: null,
        role: 'user',
        status: 'active',
        mfa_enabled: 0,
        email_verified_at: info.email_verified ? new Date() : null,
      };
    }
    if (!u) return res.status(500).send('User resolution failed');

    if (u.status !== 'active') {
      return res.redirect(`${env.FRONTEND_BASE_URL}/signin?error=AccountDisabled`);
    }

    if (!u.email_verified_at) {
      return res.redirect(`${env.FRONTEND_BASE_URL}/signin?error=EmailNotVerified`);
    }

    if (u.mfa_enabled) {
      // MFA logic
      try {
        const isTrusted = await validateTrustedCookie(
          req,
          String(u.id),
          u.role as 'user' | 'admin'
        );
        if (isTrusted) {
          // ... (full logic for trusted device login, same as in core.route.ts)
          const role = u.role as 'user' | 'admin';
          const ttlSec = ttlForRole(role, Boolean(state.remember));
          const sid = ulid();
          const refresh = signRefresh({ sub: String(u.id), sid }, ttlSec);
          // ... (create session, set cookie, etc.)
          const refreshHash = sha256(refresh);
          const ua = req.get('user-agent') ?? null;
          const ip = req.ip ?? null;
          const now = await dbNow();
          const exp = new Date(now.getTime() + ttlSec * 1000);
          await pool.query(
            `INSERT INTO sessions (id, user_id, refresh_hash, user_agent, ip, remember, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sid, String(u.id), refreshHash, ua, ip, state.remember ? 1 : 0, exp]
          );
          setRefreshCookie(res, refresh, {
            remember: Boolean(state.remember),
            maxAgeSec: ttlSec,
          });
          return res.redirect(
            buildOAuthRedirect({
              next: state.next || '/account',
            })
          );
        }
      } catch (e) {
        logger.warn({ e, userId: String(u.id) }, 'Google trusted-device bypass failed');
      }

      // MFA challenge
      const pendingId = ulid();
      const now = await dbNow();
      const exp = new Date(now.getTime() + Number(env.MFA_LOGIN_TTL_SEC) * 1000);
      await pool.query(
        `INSERT INTO mfa_login_challenges
         (id, user_id, remember, user_agent, ip, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pendingId,
          String(u.id),
          state.remember ? 1 : 0,
          req.get('user-agent') ?? null,
          req.ip ?? null,
          exp,
        ]
      );
      return res.redirect(
        buildOAuthRedirect({
          mfaChallengeId: pendingId,
          next: state.next || '/account',
        })
      );
    }

    // No MFA: Create session
    const role = u.role as 'user' | 'admin';
    const ttlSec = ttlForRole(role, Boolean(state.remember));
    const sid = ulid();
    const refresh = signRefresh({ sub: String(u.id), sid }, ttlSec);
    const refreshHash = sha256(refresh);
    const ua = req.get('user-agent') ?? null;
    const ip = req.ip ?? null;
    const now = await dbNow();
    const exp = new Date(now.getTime() + ttlSec * 1000);

    await pool.query(
      `INSERT INTO sessions (id, user_id, refresh_hash, user_agent, ip, remember, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sid, String(u.id), refreshHash, ua, ip, state.remember ? 1 : 0, exp]
    );

    setRefreshCookie(res, refresh, {
      remember: Boolean(state.remember),
      maxAgeSec: ttlSec,
    });
    return res.redirect(
      buildOAuthRedirect({
        next: state.next || '/account',
      })
    );
  } catch (e) {
    return next(e);
  }
});
