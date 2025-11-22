// src/routes/auth/core.route.ts
import { Router } from 'express';
import { requireAuth } from '../../middleware/authz.js';
import { loginByIpLimiter, loginByEmailLimiter } from '../../middleware/rateLimit.js';
import { Login, Register } from './auth.helpers.js';
import * as authService from '../../services/auth.service.js';

export const coreAuth = Router();

/** POST /api/v1/auth/register */
coreAuth.post('/register', async (req, res, next) => {
  try {
    const data = Register.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

/** POST /api/v1/auth/login */
coreAuth.post('/login', loginByIpLimiter, loginByEmailLimiter, async (req, res, next) => {
  try {
    const data = Login.parse(req.body);
    const result = await authService.login(data, req, res);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/** POST /api/v1/auth/refresh */
coreAuth.post('/refresh', async (req, res, next) => {
  try {
    const result = await authService.refresh(req, res);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/** POST /api/v1/auth/logout */
coreAuth.post('/logout', async (req, res, next) => {
  try {
    await authService.logout(req, res);
    res.status(204).end();
  } catch (e) {
    // If token is invalid, we still want to clear cookies (which logout does)
    // but the service throws 401 if token is invalid.
    // The original code returned 401.
    next(e);
  }
});

/** POST /api/v1/auth/logout-all */
coreAuth.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);
    await authService.logoutAll(userId, res);
    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
});
