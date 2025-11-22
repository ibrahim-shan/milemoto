import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/authz.js';
import { persistRuntimeFlag, runtimeFlags } from '../config/runtime.js';
import { logger } from '../utils/logger.js';
import { locationAdmin } from './admin/location.route.js';
import { companyAdmin } from './admin/company.route.js';
import { unitAdmin } from './admin/unit.route.js';
import { taxAdmin } from './admin/tax.route.js';
import { currencyAdmin } from './admin/currency.route.js';
import { shippingAdmin } from './admin/shipping.route.js';

export const admin = Router();
admin.use(requireAuth, requireRole('admin')); // all routes below require admin

admin.use('/locations', locationAdmin);
admin.use('/company', companyAdmin);
admin.use('/units', unitAdmin);
admin.use('/taxes', taxAdmin);
admin.use('/currencies', currencyAdmin);
admin.use('/shipping', shippingAdmin);

admin.get('/ping', (_req, res) => {
  res.json({ ok: true, scope: 'admin' });
});

// Runtime toggle: enforce trusted-device fingerprint for all users (admins are always enforced)
admin.get('/security/trusted-devices/fingerprint', (_req, res) => {
  res.json({
    enforceAll: runtimeFlags.trustedDeviceFpEnforceAll,
    enforceAdminsAlways: true,
  });
});

admin.post('/security/trusted-devices/fingerprint', async (req, res, next) => {
  try {
    const { enforceAll } = z.object({ enforceAll: z.boolean() }).parse(req.body ?? {});
    const before = runtimeFlags.trustedDeviceFpEnforceAll;
    await persistRuntimeFlag('trustedDeviceFpEnforceAll', enforceAll);
    try {
      const adminId = req.user ? String(req.user.id) : 'unknown';
      logger.info(
        { code: 'FingerprintPolicyToggled', adminId, before, after: enforceAll },
        'Updated trusted-device fingerprint policy'
      );
    } catch {}
    res.json({ ok: true, enforceAll });
  } catch (err) {
    next(err);
  }
});
