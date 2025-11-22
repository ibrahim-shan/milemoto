// src/routes/auth/device.route.ts
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authz.js';
import type { OkResponseDto } from '@milemoto/types';
import { env } from '../../config/env.js';
import {
  listTrustedDevices,
  revokeTrustedDevice,
  untrustCurrentDevice,
} from '../../services/auth.service.js';
import { revokeAllTrustedDevices } from './auth.helpers.js';

export const deviceAuth = Router();

// ===== Trusted Devices: list and revoke =====
deviceAuth.get('/trusted-devices', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);
    const cookie = String(req.cookies?.mm_trusted || '');

    const devices = await listTrustedDevices(userId, cookie);
    res.json(devices);
  } catch (e) {
    next(e);
  }
});

deviceAuth.post('/trusted-devices/revoke', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);
    const { id } = z.object({ id: z.string().min(10) }).parse(req.body);

    await revokeTrustedDevice(userId, id);

    // Clear cookie if it's the current device
    const cookie = String(req.cookies?.mm_trusted || '');
    const currentId = cookie.includes('.') ? cookie.split('.')[0] : '';
    if (currentId === id) {
      res.clearCookie('mm_trusted', {
        path: '/',
        domain: env.COOKIE_DOMAIN || undefined,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
      });
    }
    res.json({ ok: true } as OkResponseDto);
  } catch (e) {
    next(e);
  }
});

deviceAuth.post('/trusted-devices/revoke-all', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);

    await revokeAllTrustedDevices(userId);

    if (req.cookies?.mm_trusted) {
      res.clearCookie('mm_trusted', {
        path: '/',
        domain: env.COOKIE_DOMAIN || undefined,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
      });
    }
    res.json({ ok: true } as OkResponseDto);
  } catch (e) {
    next(e);
  }
});

deviceAuth.post('/trusted-devices/untrust-current', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);
    const cookie = String(req.cookies?.mm_trusted || '');

    // Check if cookie exists
    if (!cookie) {
      return res.status(400).json({
        error: 'NoTrustedDevice',
        message: 'No trusted device cookie found. This device is not currently trusted.',
      });
    }

    if (!cookie.includes('.')) {
      return res.status(400).json({
        error: 'InvalidCookie',
        message: 'Invalid trusted device cookie format',
      });
    }

    const parts = cookie.split('.');
    const id = parts[0];
    if (!id) {
      return res.status(400).json({
        error: 'InvalidCookie',
        message: 'Invalid device cookie format',
      });
    }

    await untrustCurrentDevice(userId, id);

    res.clearCookie('mm_trusted', {
      path: '/',
      domain: env.COOKIE_DOMAIN || undefined,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    });
    res.json({ ok: true } as OkResponseDto);
  } catch (e) {
    next(e);
  }
});
