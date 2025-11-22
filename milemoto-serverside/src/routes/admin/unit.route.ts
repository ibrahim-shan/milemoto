import { Router, type Response, type NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { z } from 'zod';
import { CreateUnit, UpdateUnit, ListQuery } from './unit.helpers.js';
import {
  createUnit,
  listUnits,
  updateUnit,
  deleteUnit,
  listAllUnits,
} from '../../services/unit.service.js';

export const unitAdmin = Router();

// Secure all routes
unitAdmin.use(requireAuth, requireRole('admin'));

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
 * POST /api/v1/admin/units
 * Create a new unit
 */
unitAdmin.post('/', async (req, res, next) => {
  try {
    const payload = CreateUnit.parse(req.body);
    const unit = await createUnit(payload);
    res.status(201).json(unit);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * GET /api/v1/admin/units
 * List units with pagination
 */
unitAdmin.get('/', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const result = await listUnits(query);
    res.json(result);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * GET /api/v1/admin/units/all
 * Simple list for dropdowns
 */
unitAdmin.get('/all', async (req, res, next) => {
  try {
    const includeInactive = ['1', 'true'].includes(
      String(req.query.includeInactive ?? '').toLowerCase()
    );
    const items = await listAllUnits(includeInactive);
    res.json({ items });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * POST /api/v1/admin/units/:id
 * Update a unit
 */
unitAdmin.post('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateUnit.parse(req.body);
    const updated = await updateUnit(id, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE /api/v1/admin/units/:id
 * Delete a unit
 */
unitAdmin.delete('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteUnit(id);
    res.status(204).end();
  } catch (e) {
    handleServiceError(e, res, next);
  }
});
