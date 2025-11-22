// src/routes/auth/mfa.route.ts
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authz.js';
import { mfaVerifyLimiter } from '../../middleware/rateLimit.js';
import type { OkResponseDto } from '@milemoto/types';
import { DisableMfa } from './auth.helpers.js';
import {
  startMfaSetup,
  verifyMfaSetup,
  disableMfa,
  regenerateBackupCodes,
  verifyMfaLogin,
} from '../../services/mfa.service.js';

export const mfaAuth = Router();

// ===== MFA: start setup =====
mfaAuth.post('/mfa/setup/start', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;

    const result = await startMfaSetup(String(userId));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// ===== MFA: verify setup & enable =====
mfaAuth.post('/mfa/setup/verify', requireAuth, async (req, res, next) => {
  try {
    const { challengeId, code } = z
      .object({
        challengeId: z.string().min(10),
        code: z.string().regex(/^\d{6}$/),
      })
      .parse(req.body);
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;

    const result = await verifyMfaSetup(String(userId), challengeId, code);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// ===== MFA: disable (requires password + TOTP or backup code) =====
mfaAuth.post('/mfa/disable', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);
    const { password, code } = DisableMfa.parse(req.body);

    const result = await disableMfa(userId, password, code);
    res.json(result as OkResponseDto);
  } catch (e) {
    next(e);
  }
});

// ===== MFA: regenerate backup codes =====
mfaAuth.post('/mfa/backup-codes/regen', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;

    const result = await regenerateBackupCodes(String(userId));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// ===== MFA: verify login challenge =====
mfaAuth.post('/mfa/login/verify', mfaVerifyLimiter, async (req, res, next) => {
  try {
    const { challengeId, code, rememberDevice } = z
      .object({
        challengeId: z.string().min(10),
        code: z.string().min(4).max(64),
        rememberDevice: z.boolean().optional().default(false),
      })
      .parse(req.body);

    const result = await verifyMfaLogin(challengeId, code, rememberDevice, req, res);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
