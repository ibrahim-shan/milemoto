// src/routes/auth/auth.helpers.ts

import { z } from 'zod';
import crypto from 'crypto';
import { type Request, type Response } from 'express';
import { pool } from '../../db/pool.js';
import { sha256, randToken } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import { runtimeFlags } from '../../config/runtime.js';
import { ulid } from 'ulid';
import { RowDataPacket } from 'mysql2';
import { sendVerificationEmail } from '../../services/emailService.js';
import { ipPrefix } from '../../utils/device.js';
import { dbNow } from '../../db/time.js';

// --- Zod Schemas ---
export const Register = z.object({
  fullName: z.string().min(2).max(191),
  email: z.string().email().max(191),
  phone: z.string().min(7).max(32).optional(),
  password: z.string().min(8).max(128),
  remember: z.coerce.boolean().optional().default(false),
});

export const ChangePassword = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8).max(128),
});

export const UpdateProfile = z.object({
  fullName: z.string().min(2).max(191),
  phone: z.union([z.string().min(7).max(32), z.null()]).optional(),
});

export const DisableMfa = z.object({
  password: z.string().min(8),
  code: z.string().min(4).max(64),
  rememberDevice: z.boolean().optional().default(false),
});

export const VerifyEmail = z.object({
  token: z.string().min(32),
});

export const ResendVerification = z.object({
  email: z.string().email(),
});

export const Login = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.coerce.boolean().optional().default(false),
});

// --- Helper Functions ---

export function backupHash(code: string) {
  return crypto.createHmac('sha256', env.BACKUP_CODE_HMAC_SECRET).update(code).digest('hex');
}

// (HMAC-based legacy cookie helpers)
export function signTrustedDevice(payload: { sub: string; exp: number }) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', env.OAUTH_STATE_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyTrustedDevice(token: string): { sub: string; exp: number } | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expSig = crypto
    .createHmac('sha256', env.OAUTH_STATE_SECRET)
    .update(body)
    .digest('base64url');
  const ok =
    expSig.length === sig.length && crypto.timingSafeEqual(Buffer.from(expSig), Buffer.from(sig));
  if (!ok) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      sub: string;
      exp: number;
    };
    if (typeof p.sub !== 'string' || typeof p.exp !== 'number') return null;
    return p;
  } catch {
    return null;
  }
}

export async function validateTrustedCookie(
  req: Request,
  userId: string,
  role?: 'user' | 'admin'
): Promise<boolean> {
  try {
    const raw = String(req.cookies?.mm_trusted || '');
    if (!raw) {
      logger.info({ userId, reason: 'no_cookie' }, 'Trusted device validation: no cookie');
      return false;
    }

    const [id, token] = raw.split('.');
    if (id && token) {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, user_id, token_hash, fingerprint, expires_at, revoked_at FROM trusted_devices WHERE id = ? LIMIT 1`,
        [id]
      );
      const rec = rows[0];
      if (!rec) {
        logger.info(
          { userId, deviceId: id, reason: 'device_not_found' },
          'Trusted device validation: device not found'
        );
        return false;
      }
      if (String(rec.user_id) !== String(userId)) {
        logger.info(
          { userId, deviceId: id, deviceUserId: rec.user_id, reason: 'user_mismatch' },
          'Trusted device validation: user mismatch'
        );
        return false;
      }
      if (rec.revoked_at) {
        logger.info(
          { userId, deviceId: id, reason: 'revoked' },
          'Trusted device validation: device revoked'
        );
        return false;
      }
      if (new Date(rec.expires_at) <= new Date()) {
        logger.info(
          { userId, deviceId: id, expiresAt: rec.expires_at, reason: 'expired' },
          'Trusted device validation: device expired'
        );
        return false;
      }
      if (sha256(token) !== rec.token_hash) {
        logger.info(
          { userId, deviceId: id, reason: 'token_mismatch' },
          'Trusted device validation: token hash mismatch'
        );
        return false;
      }

      const needFp = role === 'admin' || runtimeFlags.trustedDeviceFpEnforceAll;
      if (needFp && rec.fingerprint) {
        const ua = req.get('user-agent') || '';
        const current = sha256(`${ua}|${ipPrefix(req.ip)}`);
        if (current !== rec.fingerprint) {
          try {
            logger.warn(
              {
                code: 'TrustedDeviceFingerprintMismatch',
                userId: String(userId),
                deviceId: String(rec.id),
                role,
                ipPrefix: ipPrefix(req.ip),
                uaHash: sha256(ua),
                storedFp: String(rec.fingerprint).slice(0, 8),
                currentFp: current.slice(0, 8),
              },
              'Trusted device fingerprint mismatch; requiring MFA'
            );
          } catch {}
          return false;
        }
      }
      void pool.query(`UPDATE trusted_devices SET last_used_at = NOW() WHERE id = ?`, [id]);
      logger.info(
        { userId, deviceId: id, role },
        'Trusted device validation: SUCCESS - bypassing MFA'
      );
      return true;
    }

    const legacy = verifyTrustedDevice(raw);
    if (legacy && legacy.sub === String(userId) && legacy.exp > Date.now()) {
      logger.info(
        { userId, reason: 'legacy_token_valid' },
        'Trusted device validation: using legacy token'
      );
      return true;
    }
    logger.info(
      { userId, reason: 'invalid_format' },
      'Trusted device validation: invalid cookie format'
    );
    return false;
  } catch (e) {
    logger.warn({ e, userId }, 'validateTrustedCookie failed');
    return false;
  }
}

export async function createTrustedDevice(req: Request, res: Response, userId: string) {
  try {
    logger.info({ userId, remoteAddress: req.ip }, 'Creating trusted device...');
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = sha256(token);
    const id = ulid();
    const now = await dbNow();
    const exp = new Date(now.getTime() + Number(env.TRUSTED_DEVICE_TTL_DAYS) * 24 * 60 * 60 * 1000);
    const ua = req.get('user-agent') ?? null;
    const fp = sha256(`${ua || ''}|${ipPrefix(req.ip)}`);
    await pool.query(
      `INSERT INTO trusted_devices (id, user_id, token_hash, fingerprint, user_agent, ip, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, tokenHash, fp, ua, req.ip ?? null, exp, now]
    );
    res.cookie('mm_trusted', `${id}.${token}`, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
      expires: exp,
      path: '/',
    });
    logger.info(
      { userId, deviceId: id, expiresAt: exp.toISOString() },
      'Trusted device created successfully'
    );
  } catch (e) {
    logger.error({ e, userId }, 'Failed to create trusted device');
  }
}

export async function revokeAllTrustedDevices(userId: string): Promise<void> {
  try {
    await pool.query(
      `UPDATE trusted_devices SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
      [userId]
    );
  } catch (e) {
    logger.warn({ e, userId }, 'Failed to revoke trusted devices');
  }
}

// (Session/Cookie helpers)
export function setRefreshCookie(
  res: Response,
  token: string,
  opts: { remember: boolean; maxAgeSec: number }
) {
  const base = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/api',
  };
  if (opts.remember) {
    res.cookie(env.REFRESH_COOKIE_NAME, token, {
      ...base,
      maxAge: opts.maxAgeSec * 1000,
    });
  } else {
    res.cookie(env.REFRESH_COOKIE_NAME, token, base);
  }
}

export function ttlForRole(role: 'user' | 'admin', remember: boolean) {
  if (role === 'admin') {
    return remember
      ? Number(env.ADMIN_REFRESH_TOKEN_TTL_SEC)
      : Number(env.ADMIN_SESSION_REFRESH_TTL_SEC);
  }
  return remember
    ? Number(env.USER_REFRESH_TOKEN_TTL_SEC)
    : Number(env.USER_SESSION_REFRESH_TTL_SEC);
}

// (OAuth helpers)
export type OAuthStatePayload = { next: string; remember: boolean; nonce: string };

export function signState(payload: OAuthStatePayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', env.OAUTH_STATE_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyState(state: string): OAuthStatePayload | null {
  const [body, sig] = state.split('.');
  if (!body || !sig) return null;
  const exp = crypto.createHmac('sha256', env.OAUTH_STATE_SECRET).update(body).digest('base64url');
  const ok =
    exp.length === sig.length && crypto.timingSafeEqual(Buffer.from(exp), Buffer.from(sig));
  if (!ok) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8')
    ) as Partial<OAuthStatePayload>;
    if (
      !parsed ||
      typeof parsed.next !== 'string' ||
      typeof parsed.remember !== 'boolean' ||
      typeof parsed.nonce !== 'string'
    ) {
      return null;
    }
    return parsed as OAuthStatePayload;
  } catch {
    return null;
  }
}

export function safeNext(n: unknown): string {
  let s: string | undefined = undefined;

  if (typeof n === 'string') {
    s = n;
  } else if (Array.isArray(n) && n.length > 0 && typeof n[0] === 'string') {
    s = n[0];
  }
  if (s && s.startsWith('/') && !s.startsWith('//')) {
    return s;
  }
  return '/account';
}

// (Email helpers)
export async function sendNewVerificationEmail(userId: string, email: string) {
  try {
    await pool.query('DELETE FROM email_verifications WHERE user_id = ?', [userId]);
    const token = randToken(32);
    const hash = sha256(token);
    const now = await dbNow();
    const exp = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      `INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, hash, exp]
    );

    const verifyUrl = `${env.FRONTEND_BASE_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(email.toLowerCase(), verifyUrl);
  } catch (emailError: unknown) {
    logger.error(
      { err: emailError, emailHash: sha256(email.toLowerCase()) },
      'Failed to send verification email'
    );
  }
}
