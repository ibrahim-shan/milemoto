import { Router, type Response, type NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { CompanyProfileInput } from './company.helpers.js';
import { getCompanyProfile, upsertCompanyProfile } from '../../services/company.service.js';

const companyAdmin = Router();

companyAdmin.use(requireAuth, requireRole('admin'));

// Helper for error handling
function handleServiceError(error: unknown, res: Response, next: NextFunction) {
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    const e = error as { status: number; code?: string; message: string };
    return res.status(e.status).json({
      code: e.code ?? 'Error',
      message: e.message,
    });
  }
  next(error);
}

/**
 * GET /api/v1/admin/company
 * Get the company profile
 */
companyAdmin.get('/', async (_req, res, next) => {
  try {
    const profile = await getCompanyProfile();
    res.json(profile);
  } catch (err) {
    handleServiceError(err, res, next);
  }
});

/**
 * PUT /api/v1/admin/company
 * Update the company profile
 */
companyAdmin.put('/', async (req, res, next) => {
  try {
    const payload = CompanyProfileInput.parse(req.body);
    const profile = await upsertCompanyProfile(payload);
    res.json(profile);
  } catch (err) {
    handleServiceError(err, res, next);
  }
});

export { companyAdmin };
