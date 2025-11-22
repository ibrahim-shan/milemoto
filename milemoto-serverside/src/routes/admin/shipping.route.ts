import { Router, type Response, type NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { z } from 'zod';
import {
  UpdateShippingMethod,
  CreateAreaRate,
  UpdateAreaRate,
  ListQuery,
} from './shipping.helpers.js';
import {
  listShippingMethods,
  updateShippingMethod,
  createAreaRate,
  listAreaRates,
  updateAreaRate,
  deleteAreaRate,
} from '../../services/shipping.service.js';

export const shippingAdmin = Router();

// Secure all routes
shippingAdmin.use(requireAuth, requireRole('admin'));

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

// ==== Global Shipping Methods (GET / UPDATE) ====

/**
 * GET /api/v1/admin/shipping/methods
 * List all shipping methods (Flat Rate, Area Wise, Product Wise)
 */
shippingAdmin.get('/methods', async (req, res, next) => {
  try {
    const methods = await listShippingMethods();
    res.json(methods);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * PATCH /api/v1/admin/shipping/methods/:code
 * Update a shipping method (e.g., toggle status or set flat rate cost)
 */
shippingAdmin.patch('/methods/:code', async (req, res, next) => {
  try {
    const code = z.enum(['product_wise', 'flat_rate', 'area_wise']).parse(req.params.code);
    const body = UpdateShippingMethod.parse(req.body);
    const updated = await updateShippingMethod(code, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// ==== Area Wise Rates (CRUD) ====

/**
 * GET /api/v1/admin/shipping/area-rates
 * List area rates with pagination
 */
shippingAdmin.get('/area-rates', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const data = await listAreaRates(query);
    res.json(data);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * POST /api/v1/admin/shipping/area-rates
 * Create a new area rate rule
 */
shippingAdmin.post('/area-rates', async (req, res, next) => {
  try {
    const payload = CreateAreaRate.parse(req.body);
    const rate = await createAreaRate(payload);
    res.status(201).json(rate);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * PATCH /api/v1/admin/shipping/area-rates/:id
 * Update an area rate (cost only)
 */
shippingAdmin.patch('/area-rates/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateAreaRate.parse(req.body);
    const updated = await updateAreaRate(id, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE /api/v1/admin/shipping/area-rates/:id
 * Delete an area rate rule
 */
shippingAdmin.delete('/area-rates/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteAreaRate(id);
    res.status(204).end();
  } catch (e) {
    handleServiceError(e, res, next);
  }
});
