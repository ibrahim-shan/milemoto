// src/routes/auth/user.route.ts
import { Router } from 'express';
import { verifyAccess } from '../../utils/jwt.js';
import { requireAuth } from '../../middleware/authz.js';
import { UpdateProfile } from './auth.helpers.js';
import { getUserProfile, updateUserProfile } from '../../services/auth.service.js';

export const userAuth = Router();

/** GET /api/v1/auth/me */
userAuth.get('/me', async (req, res, next) => {
  const authz = req.get('authorization') || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const { sub } = verifyAccess(token);
    const user = await getUserProfile(sub);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

/** POST /api/v1/auth/me/update - update full name and phone */
userAuth.post('/me/update', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userId = String(req.user.id);

    const body = UpdateProfile.parse(req.body);
    const user = await updateUserProfile(userId, {
      fullName: body.fullName,
      phone: body.phone,
    });
    res.json(user);
  } catch (e) {
    return next(e);
  }
});
