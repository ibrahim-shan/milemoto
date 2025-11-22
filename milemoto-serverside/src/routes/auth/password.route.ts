// src/routes/auth/password.route.ts
import { Router } from 'express';
import { requireAuth } from '../../middleware/authz.js';
import { authLimiter, loginByEmailLimiter } from '../../middleware/rateLimit.js';
import type { OkResponseDto } from '@milemoto/types';
import { z } from 'zod';
import { ChangePassword, VerifyEmail, ResendVerification } from './auth.helpers.js';
import {
  changePassword,
  verifyEmailToken,
  resendVerificationEmail,
  requestPasswordReset,
  resetPasswordWithToken,
} from '../../services/auth.service.js';

export const passwordAuth = Router();

// ===== Change Password (Logged-In) =====
passwordAuth.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;

    const { oldPassword, newPassword } = ChangePassword.parse(req.body);
    await changePassword(String(userId), oldPassword, newPassword);
    res.json({ ok: true } as OkResponseDto);
  } catch (e) {
    next(e);
  }
});

// ===== Verify Email =====
passwordAuth.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = VerifyEmail.parse(req.body);
    const result = await verifyEmailToken(token);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// ===== Resend Verification Email =====
passwordAuth.post('/verify-email/resend', authLimiter, async (req, res, next) => {
  try {
    const { email } = ResendVerification.parse(req.body);
    const result = await resendVerificationEmail(email);
    res.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    next(e);
  }
});

/** POST /api/v1/auth/forgot */
passwordAuth.post('/forgot', authLimiter, loginByEmailLimiter, async (req, res, next) => {
  try {
    const email = z.string().email().parse(req.body?.email);
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    next(e);
  }
});

/** POST /api/v1/auth/reset */
passwordAuth.post('/reset', async (req, res, next) => {
  try {
    const body = z
      .object({
        token: z.string().min(10),
        password: z.string().min(8).max(128),
      })
      .parse(req.body);

    const result = await resetPasswordWithToken(body.token, body.password);
    res.json(result as OkResponseDto & { email: string | null });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    next(e);
  }
});
