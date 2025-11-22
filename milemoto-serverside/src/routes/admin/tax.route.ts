import { Router, type Response, type NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { z } from 'zod';
import { CreateTax, UpdateTax, ListQuery } from './tax.helpers.js';
import { createTax, listTaxes, updateTax, deleteTax } from '../../services/tax.service.js';

export const taxAdmin = Router();

// Secure all routes
taxAdmin.use(requireAuth, requireRole('admin'));

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

// ==== Endpoints =================================================

/**
 * POST /api/v1/admin/taxes
 * Create a new tax
 */
taxAdmin.post('/', async (req, res, next) => {
  try {
    const payload = CreateTax.parse(req.body);
    const tax = await createTax(payload);
    res.status(201).json(tax);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * GET /api/v1/admin/taxes
 * List taxes with pagination
 */
taxAdmin.get('/', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const result = await listTaxes(query);
    res.json(result);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * POST /api/v1/admin/taxes/:id
 * Update a tax
 */
taxAdmin.post('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateTax.parse(req.body);
    const updated = await updateTax(id, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE /api/v1/admin/taxes/:id
 * Delete a tax
 */
taxAdmin.delete('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteTax(id);
    res.status(204).end();
  } catch (e) {
    handleServiceError(e, res, next);
  }
});
