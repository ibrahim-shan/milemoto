import argon2 from 'argon2';
import { ulid } from 'ulid';
import { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { dbNow } from '../db/time.js';
import type {
  AuthOutputDto,
  MfaChallengeDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from '@milemoto/types';
import {
  Register,
  Login,
  validateTrustedCookie,
  setRefreshCookie,
  ttlForRole,
  sendNewVerificationEmail,
  revokeAllTrustedDevices,
} from '../routes/auth/auth.helpers.js';
import { z } from 'zod';

type ServiceError = Error & { status?: number; code?: string };

function httpError(status: number, code: string, message: string): ServiceError {
  const err = new Error(message) as ServiceError;
  err.status = status;
  err.code = code;
  return err;
}

export async function register(data: z.infer<typeof Register>) {
  const { fullName, email, phone, password } = data;
  const hash = await argon2.hash(password, { type: argon2.argon2id });

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status)
        VALUES (?, ?, ?, ?, 'user', 'active')`,
      [fullName, email.toLowerCase(), phone ?? null, hash]
    );

    const userId = String(result.insertId);

    // --- Send Verification Email ---
    try {
      await sendNewVerificationEmail(userId, email);
    } catch (emailError: unknown) {
      logger.error(
        { err: emailError, emailHash: sha256(email.toLowerCase()) },
        'Failed to send verification email'
      );
    }
    return { ok: true, userId: userId } as RegisterResponseDto;
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e) {
      const error = e as { code?: string; message?: string };

      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message && error.message.includes('uniq_users_phone')) {
          throw httpError(409, 'ER_DUP_PHONE', 'Phone number already registered');
        }

        throw httpError(409, 'ER_DUP_EMAIL', 'Email address already registered');
      }
    }
    throw e;
  }
}

export async function login(data: z.infer<typeof Login>, req: Request, res: Response) {
  const { email, password, remember } = data;
  const invalid = () => httpError(401, 'InvalidCredentials', 'Invalid credentials');

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, email, phone, password_hash, role, status, mfa_enabled, email_verified_at
        FROM users WHERE email = ? LIMIT 1`,
    [email.toLowerCase()]
  );
  const u = rows[0];
  if (!u) throw invalid();
  if (u.status !== 'active') {
    logger.warn(
      { code: 'LoginInactiveUser', email: sha256(email.toLowerCase()) },
      'Inactive login'
    );
    throw invalid();
  }

  const ok = await argon2.verify(u.password_hash, password);
  if (!ok) throw invalid();

  if (!u.email_verified_at) {
    logger.info(
      { code: 'LoginEmailUnverified', email: sha256(email.toLowerCase()) },
      'Unverified login'
    );
    throw httpError(403, 'EmailNotVerified', 'Please verify your email before signing in.');
  }

  if (u.mfa_enabled) {
    try {
      const isTrusted = await validateTrustedCookie(req, String(u.id), u.role as 'user' | 'admin');
      if (isTrusted) {
        // Trusted device login
        const role = u.role as 'user' | 'admin';
        const ttlSec = ttlForRole(role, Boolean(remember));
        const sid = ulid();
        const refresh = signRefresh({ sub: String(u.id), sid }, ttlSec);
        const refreshHash = sha256(refresh);
        const now2 = await dbNow();

        const exp2 = new Date(now2.getTime() + ttlSec * 1000);
        await pool.query(
          `INSERT INTO sessions (id, user_id, refresh_hash, user_agent, ip, remember, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            sid,
            String(u.id),
            refreshHash,
            req.get('user-agent') ?? null,
            req.ip ?? null,
            remember ? 1 : 0,
            exp2,
          ]
        );
        setRefreshCookie(res, refresh, { remember: Boolean(remember), maxAgeSec: ttlSec });
        const access = signAccess({ sub: String(u.id), role });
        return {
          accessToken: access,
          user: {
            id: String(u.id),
            fullName: u.full_name,
            email: u.email,
            phone: u.phone,
            role,
            mfaEnabled: Boolean(u.mfa_enabled),
          },
        } as AuthOutputDto;
      }
    } catch (err) {
      logger.error(
        { err, userId: String(u.id) },
        'Trusted-device bypass failed; falling back to MFA'
      );
    }

    const pendingId = ulid();
    const now = await dbNow();
    const exp = new Date(now.getTime() + Number(env.MFA_LOGIN_TTL_SEC) * 1000);

    await pool.query(
      `INSERT INTO mfa_login_challenges (id, user_id, remember, user_agent, ip, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pendingId,
        String(u.id),
        remember ? 1 : 0,
        req.get('user-agent') ?? null,
        req.ip ?? null,
        exp,
      ]
    );

    return {
      mfaRequired: true,
      challengeId: pendingId,
      method: 'totp_or_backup',
      expiresAt: exp.toISOString(),
    } as MfaChallengeDto;
  }

  // No MFA: create session and return tokens
  const role = u.role as 'user' | 'admin';
  const ttlSec = ttlForRole(role, Boolean(remember));
  const sid = ulid();
  const refresh = signRefresh({ sub: String(u.id), sid }, ttlSec);
  const refreshHash = sha256(refresh);

  const now2 = await dbNow();
  const exp2 = new Date(now2.getTime() + ttlSec * 1000);

  await pool.query(
    `INSERT INTO sessions (id, user_id, refresh_hash, user_agent, ip, remember, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sid,
      String(u.id),
      refreshHash,
      req.get('user-agent') ?? null,
      req.ip ?? null,
      remember ? 1 : 0,
      exp2,
    ]
  );

  setRefreshCookie(res, refresh, { remember: Boolean(remember), maxAgeSec: ttlSec });
  const access = signAccess({ sub: String(u.id), role });
  return {
    accessToken: access,
    user: {
      id: String(u.id),
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role,
      mfaEnabled: Boolean(u.mfa_enabled),
    },
  } as AuthOutputDto;
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (!token) throw httpError(401, 'NoRefresh', 'No refresh token');

  const { sid, sub: userId } = verifyRefresh(token);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT refresh_hash, revoked_at, expires_at, remember
        FROM sessions WHERE id = ? AND user_id = ? LIMIT 1`,
    [sid, userId]
  );
  const s = rows[0];
  if (!s || s.revoked_at || new Date(s.expires_at) < new Date()) {
    throw httpError(401, 'InvalidSession', 'Invalid session');
  }
  if (sha256(token) !== s.refresh_hash) {
    await pool.query(`UPDATE sessions SET revoked_at = NOW() WHERE id = ?`, [sid]);
    throw httpError(401, 'TokenReuse', 'Token reuse detected');
  }

  const [urows] = await pool.query<RowDataPacket[]>(`SELECT role FROM users WHERE id = ? LIMIT 1`, [
    userId,
  ]);
  const urec = urows[0];
  if (!urec) throw httpError(401, 'UserNotFound', 'User not found');
  const role = urec.role as 'user' | 'admin';
  const remember = Boolean(s.remember);
  const ttlSec = ttlForRole(role, remember);

  const newSid = ulid();
  const newRefresh = signRefresh({ sub: userId, sid: newSid }, ttlSec);
  const newHash = sha256(newRefresh);

  await pool.query(`UPDATE sessions SET revoked_at = NOW(), replaced_by = ? WHERE id = ?`, [
    newSid,
    sid,
  ]);

  const now = await dbNow();
  const exp = new Date(now.getTime() + ttlSec * 1000);

  await pool.query(
    `INSERT INTO sessions (id, user_id, refresh_hash, user_agent, ip, remember, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [newSid, userId, newHash, req.get('user-agent') ?? null, req.ip ?? null, remember ? 1 : 0, exp]
  );

  setRefreshCookie(res, newRefresh, { remember, maxAgeSec: ttlSec });
  const access = signAccess({ sub: userId, role });

  return { accessToken: access } as RefreshResponseDto;
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (token) {
      try {
        const { sid } = verifyRefresh(token);
        await pool.query(`UPDATE sessions SET revoked_at = NOW() WHERE id = ?`, [sid]);
      } catch {
        /* ignore */
      }
    }
    res.clearCookie(env.REFRESH_COOKIE_NAME, {
      path: '/api',
      domain: env.COOKIE_DOMAIN || undefined,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    });
  } catch {
    throw httpError(401, 'InvalidToken', 'Invalid token');
  }
}

export async function logoutAll(userId: string, res: Response) {
  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
  await revokeAllTrustedDevices(userId);

  res.clearCookie(env.REFRESH_COOKIE_NAME, {
    path: '/api',
    domain: env.COOKIE_DOMAIN || undefined,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  });
  res.clearCookie('mm_trusted', {
    path: '/',
    domain: env.COOKIE_DOMAIN || undefined,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  });

  logger.info({ code: 'UserLogoutAll', userId }, 'User requested logout on all devices');
}

// ===== User Profile Functions =====

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, email, phone, role, status, mfa_enabled FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  const u = rows[0];
  if (!u) throw httpError(404, 'UserNotFound', 'User not found');

  return {
    id: String(u.id),
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    mfaEnabled: Boolean(u.mfa_enabled),
  };
}

/**
 * Update user profile (full name and phone)
 */
export async function updateUserProfile(
  userId: string,
  data: { fullName: string; phone?: string | null | undefined }
) {
  const phoneVal = data.phone === undefined ? undefined : data.phone; // allow explicit null

  const fields: string[] = ['full_name = ?'];
  const values: Array<string | null> = [data.fullName];
  if (phoneVal !== undefined) {
    fields.push('phone = ?');
    values.push(phoneVal);
  }
  values.push(userId);

  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values as never);

  // Fetch and return updated user
  return getUserProfile(userId);
}

// ===== Trusted Device Functions =====

/**
 * List all trusted devices for a user
 */
export async function listTrustedDevices(userId: string, currentCookie: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, user_id, user_agent, ip, created_at, last_used_at, expires_at, revoked_at
       FROM trusted_devices
      WHERE user_id = ?
      ORDER BY created_at DESC`,
    [userId]
  );

  const currentId = currentCookie.includes('.') ? currentCookie.split('.')[0] : '';

  const devices = rows.map((d) => ({
    id: String(d.id),
    userAgent: d.user_agent as string | null,
    ip: d.ip as string | null,
    createdAt: d.created_at ? new Date(d.created_at).toISOString() : null,
    lastUsedAt: d.last_used_at ? new Date(d.last_used_at).toISOString() : null,
    expiresAt: d.expires_at ? new Date(d.expires_at).toISOString() : null,
    revokedAt: d.revoked_at ? new Date(d.revoked_at).toISOString() : null,
    current: String(d.id) === currentId,
  }));

  return { items: devices };
}

/**
 * Revoke a specific trusted device
 */
export async function revokeTrustedDevice(userId: string, deviceId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM trusted_devices WHERE id = ? AND user_id = ? AND revoked_at IS NULL LIMIT 1`,
    [deviceId, userId]
  );
  const rec = rows[0];
  if (!rec) throw httpError(404, 'DeviceNotFound', 'Device not found');

  await pool.query(`UPDATE trusted_devices SET revoked_at = NOW() WHERE id = ?`, [deviceId]);
}

/**
 * Revoke current device by ID
 */
export async function untrustCurrentDevice(userId: string, deviceId: string) {
  await pool.query(`UPDATE trusted_devices SET revoked_at = NOW() WHERE id = ? AND user_id = ?`, [
    deviceId,
    userId,
  ]);
}

// ===== Password Management Functions =====

/**
 * Change password for logged-in user
 */
export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT password_hash FROM users WHERE id = ?', [
    userId,
  ]);
  const u = rows[0];

  if (!u || !u.password_hash) {
    throw httpError(404, 'UserNotFound', 'User not found');
  }

  const ok = await argon2.verify(u.password_hash, oldPassword);
  if (!ok) {
    throw httpError(401, 'InvalidPassword', 'Invalid current password');
  }

  const matchesExisting = await argon2.verify(u.password_hash, newPassword);
  if (matchesExisting) {
    throw httpError(
      400,
      'PasswordReuse',
      'New password must be different from the current password'
    );
  }

  const newHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

  await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ?', [userId]);
  await revokeAllTrustedDevices(String(userId));
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(token: string) {
  const hash = sha256(token);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ev.id, ev.user_id, u.email
       FROM email_verifications ev
       JOIN users u ON u.id = ev.user_id
      WHERE ev.token_hash = ? AND ev.used_at IS NULL AND ev.expires_at > NOW()
      LIMIT 1`,
    [hash]
  );
  const verification = rows[0];

  if (!verification) {
    throw httpError(400, 'InvalidToken', 'Invalid or expired token');
  }

  await pool.query('UPDATE email_verifications SET used_at = NOW() WHERE id = ?', [
    verification.id,
  ]);
  await pool.query('UPDATE users SET email_verified_at = NOW() WHERE id = ?', [
    verification.user_id,
  ]);

  await revokeAllTrustedDevices(String(verification.user_id));

  return { ok: true, email: verification.email ?? null };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, email_verified_at FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase()]
  );
  const u = rows[0];

  if (u && !u.email_verified_at) {
    void sendNewVerificationEmail(String(u.id), email.toLowerCase());
  }

  // Always revoke trusted devices if user exists
  if (u) {
    await revokeAllTrustedDevices(String(u.id));
  }

  return { ok: true };
}

/**
 * Request password reset - creates token and sends email
 */
export async function requestPasswordReset(email: string) {
  const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

  const [rows] = await pool.query<RowDataPacket[]>(`SELECT id FROM users WHERE email = ? LIMIT 1`, [
    email.toLowerCase(),
  ]);
  const u = rows[0];

  if (u) {
    const { randToken } = await import('../utils/crypto.js');
    const token = randToken(32);
    const hash = sha256(token);
    const now = await dbNow();
    const exp = new Date(now.getTime() + PASSWORD_RESET_TTL_MS);

    await pool.query(
      `UPDATE password_resets
          SET used_at = NOW()
        WHERE user_id = ?
          AND used_at IS NULL`,
      [String(u.id)]
    );

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [String(u.id), hash, exp]
    );

    const resetUrl = `${env.FRONTEND_BASE_URL}/reset-password?token=${token}`;

    try {
      const { sendPasswordResetEmail } = await import('./emailService.js');
      await sendPasswordResetEmail(email.toLowerCase(), resetUrl);
      if (env.NODE_ENV === 'development') {
        logger.info({ resetUrl }, 'Password reset link sent');
      }
    } catch (emailError) {
      logger.error({ err: emailError, email }, 'Failed to send password reset email');
    }

    await revokeAllTrustedDevices(String(u.id));
  }

  return { ok: true };
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  const hash = sha256(token);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT pr.id, pr.user_id FROM password_resets pr
     WHERE pr.token_hash = ? AND pr.used_at IS NULL AND pr.expires_at > NOW()
     LIMIT 1`,
    [hash]
  );
  const r = rows[0];
  if (!r) throw httpError(400, 'InvalidToken', 'Invalid or expired token');

  const [userRows] = await pool.query<RowDataPacket[]>(
    `SELECT email, password_hash FROM users WHERE id = ? LIMIT 1`,
    [String(r.user_id)]
  );
  const existing = userRows[0];
  const userEmail = existing?.email ?? null;

  if (existing?.password_hash) {
    const matchesExisting = await argon2.verify(existing.password_hash, newPassword);
    if (matchesExisting) {
      throw httpError(
        400,
        'PasswordReuse',
        'New password must be different from the current password'
      );
    }
  }

  const pwHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [pwHash, String(r.user_id)]);
  await pool.query(`UPDATE password_resets SET used_at = NOW() WHERE id = ?`, [r.id]);

  await pool.query(`UPDATE sessions SET revoked_at = NOW() WHERE user_id = ?`, [String(r.user_id)]);
  await revokeAllTrustedDevices(String(r.user_id));

  return { ok: true, email: userEmail };
}
