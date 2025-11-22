import { Router, type Response, type NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { z } from 'zod';
import { CreateCurrency, UpdateCurrency, ListQuery } from './currency.helpers.js';
import {
  createCurrency,
  listCurrencies,
  updateCurrency,
  deleteCurrency,
  listAllCurrencies,
} from '../../services/currency.service.js';

export const currencyAdmin = Router();

// Secure all routes
currencyAdmin.use(requireAuth, requireRole('admin'));

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
 * POST /api/v1/admin/currencies
 * Create a new currency
 */
currencyAdmin.post('/', async (req, res, next) => {
  try {
    const payload = CreateCurrency.parse(req.body);
    const currency = await createCurrency(payload);
    res.status(201).json(currency);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * GET /api/v1/admin/currencies
 * List currencies with pagination
 */
currencyAdmin.get('/', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const result = await listCurrencies(query);
    res.json(result);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * GET /api/v1/admin/currencies/all
 * Simple list for dropdowns
 */
currencyAdmin.get('/all', async (req, res, next) => {
  try {
    const includeInactive = ['1', 'true', 'yes'].includes(
      String(req.query.includeInactive ?? '').toLowerCase()
    );
    const items = await listAllCurrencies(includeInactive);
    res.json({ items });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * POST /api/v1/admin/currencies/:id
 * Update a currency
 */
currencyAdmin.post('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateCurrency.parse(req.body);
    const updated = await updateCurrency(id, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE /api/v1/admin/currencies/:id
 * Delete a currency
 */
currencyAdmin.delete('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteCurrency(id);
    res.status(204).end();
  } catch (e) {
    handleServiceError(e, res, next);
  }
});
