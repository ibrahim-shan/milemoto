import { Router, type Response, type NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { uploadJson } from '../../middleware/uploader.js';
import { z } from 'zod';
import {
  CreateCountry,
  ListQuery,
  UpdateCountry,
  CreateState,
  UpdateState,
  CreateCity,
  UpdateCity,
  ImportCountries,
} from './location.helpers.js';
import {
  createCountry,
  listCountries,
  updateCountry,
  deleteCountry,
  listAllCountries,
  createState,
  listStates,
  updateState,
  deleteState,
  listAllStates,
  createCity,
  listCities,
  updateCity,
  deleteCity,
  exportCountries,
  importCountries as persistCountriesImport,
  exportStates,
  importStates as persistStatesImport,
  exportCities,
  importCities as persistCitiesImport,
} from '../../services/location.service.js';

// Create a new router instance for location-related admin endpoints
export const locationAdmin = Router();

// Apply security middleware to ALL routes defined in this file
locationAdmin.use(requireAuth, requireRole('admin'));

type LocationServiceError = Error & { status?: number; code?: string };

function isServiceError(error: unknown): error is LocationServiceError {
  return Boolean(error && typeof error === 'object' && 'message' in error && 'status' in error);
}

function handleServiceError(error: unknown, res: Response, next: NextFunction) {
  if (isServiceError(error)) {
    const status = error.status ?? 500;
    return res.status(status).json({
      code: error.code ?? 'Error',
      message: error.message,
    });
  }
  return next(error);
}

// ==== COUNTRIES =================================================

/**
 * CREATE: POST /api/v1/admin/locations/countries
 * Create a new country
 */
locationAdmin.post('/countries', async (req, res, next) => {
  try {
    const payload = CreateCountry.parse(req.body);
    const country = await createCountry(payload);
    res.status(201).json(country);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * READ: GET /api/v1/admin/locations/countries
 * List countries with pagination and search
 */
locationAdmin.get('/countries', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const data = await listCountries(query);
    res.json(data);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * UPDATE: POST /api/v1/admin/locations/countries/:id
 * Update an existing country
 */
locationAdmin.post('/countries/:id', async (req, res, next) => {
  try {
    const countryId = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateCountry.parse(req.body);

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'At least one field to update must be provided',
      });
    }

    const country = await updateCountry(countryId, body);
    res.json(country);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE: DELETE /api/v1/admin/locations/countries/:id
 * Delete a country
 */
locationAdmin.delete('/countries/:id', async (req, res, next) => {
  try {
    const countryId = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteCountry(countryId);
    res.status(204).end(); // No Content
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// ==== SUPPORTING ENDPOINTS (Step 4) ==============================

/**
 * GET /api/v1/admin/locations/countries/all
 * Get a simple list of all active countries (for dropdowns)
 */
locationAdmin.get('/countries/all', async (req, res, next) => {
  try {
    const includeInactive =
      ['1', 'true', 'yes'].includes(String(req.query.includeInactive ?? '').toLowerCase()) || false;
    const items = await listAllCountries(includeInactive);
    res.json({ items });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// ==== STATES ====================================================

/**
 * CREATE: POST /api/v1/admin/locations/states
 * Create a new state
 */
locationAdmin.post('/states', async (req, res, next) => {
  try {
    const payload = CreateState.parse(req.body);
    const state = await createState(payload);
    res.status(201).json(state);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * READ: GET /api/v1/admin/locations/states
 * List states with pagination and search
 */
locationAdmin.get('/states', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const data = await listStates(query);
    res.json(data);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * UPDATE: POST /api/v1/admin/locations/states/:id
 * Update an existing state
 */
locationAdmin.post('/states/:id', async (req, res, next) => {
  try {
    const stateId = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateState.parse(req.body);

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'At least one field to update must be provided',
      });
    }

    const updated = await updateState(stateId, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE: DELETE /api/v1/admin/locations/states/:id
 * Delete a state
 */
locationAdmin.delete('/states/:id', async (req, res, next) => {
  try {
    const stateId = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteState(stateId);
    res.status(204).end(); // No Content
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * GET /api/v1/admin/locations/states/all
 * Get a simple list of all active states (for dropdowns)
 */
locationAdmin.get('/states/all', async (req, res, next) => {
  try {
    const items = await listAllStates();
    res.json({ items });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// ==== CITIES ====================================================

/**
 * CREATE: POST /api/v1/admin/locations/cities
 * Create a new city
 */
locationAdmin.post('/cities', async (req, res, next) => {
  try {
    const payload = CreateCity.parse(req.body);
    const city = await createCity(payload);
    res.status(201).json(city);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * READ: GET /api/v1/admin/locations/cities
 * List cities with pagination and search
 */
locationAdmin.get('/cities', async (req, res, next) => {
  try {
    const query = ListQuery.parse(req.query);
    const data = await listCities(query);
    res.json(data);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * UPDATE: POST /api/v1/admin/locations/cities/:id
 * Update an existing city
 */
locationAdmin.post('/cities/:id', async (req, res, next) => {
  try {
    const cityId = z.coerce.number().int().min(1).parse(req.params.id);
    const body = UpdateCity.parse(req.body);

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        code: 'ValidationError',
        message: 'At least one field to update must be provided',
      });
    }

    const updated = await updateCity(cityId, body);
    res.json(updated);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

/**
 * DELETE: DELETE /api/v1/admin/locations/cities/:id
 * Delete a city
 */
locationAdmin.delete('/cities/:id', async (req, res, next) => {
  try {
    const cityId = z.coerce.number().int().min(1).parse(req.params.id);
    await deleteCity(cityId);
    res.status(204).end(); // No Content
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// ==== IMPORT / EXPORT ===========================================

// --- Countries Import/Export ---

locationAdmin.get('/countries/export', async (req, res, next) => {
  try {
    const filename = `export-countries-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const rows = await exportCountries();
    res.json(rows); // Send the complete JSON array
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

locationAdmin.post('/countries/import', uploadJson.single('file'), async (req, res, next) => {
  // ... (This endpoint was correct and remains unchanged) ...
  try {
    if (!req.file) {
      return res.status(400).json({ code: 'FileRequired', message: 'No JSON file uploaded' });
    }

    const json = JSON.parse(req.file.buffer.toString('utf-8'));
    const rows = ImportCountries.parse(json);

    const affectedRows = await persistCountriesImport(rows);
    res.status(201).json({
      message: 'Import successful',
      affectedRows,
    });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// --- States Import/Export ---

locationAdmin.get('/states/export', async (req, res, next) => {
  try {
    const filename = `export-states-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const rows = await exportStates();
    res.json(rows);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

locationAdmin.post('/states/import', uploadJson.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 'FileRequired', message: 'No JSON file uploaded' });
    }

    const json = JSON.parse(req.file.buffer.toString('utf-8'));
    const importSchema = z.array(
      z.object({
        name: z.string().min(2),
        country_code: z.string().min(2),
        status: z.enum(['active', 'inactive']),
      })
    );
    const rows = importSchema.parse(json);
    const affectedRows = await persistStatesImport(rows);

    res.status(201).json({
      message: 'Import successful',
      affectedRows,
    });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

// --- Cities Import/Export ---

locationAdmin.get('/cities/export', async (req, res, next) => {
  try {
    const filename = `export-cities-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const rows = await exportCities();
    res.json(rows);
  } catch (e) {
    handleServiceError(e, res, next);
  }
});

locationAdmin.post('/cities/import', uploadJson.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 'FileRequired', message: 'No JSON file uploaded' });
    }

    const json = JSON.parse(req.file.buffer.toString('utf-8'));
    const importSchema = z.array(
      z.object({
        name: z.string().min(2),
        state_name: z.string().min(2),
        country_code: z.string().min(2),
        status: z.enum(['active', 'inactive']),
      })
    );
    const rows = importSchema.parse(json);
    const affectedRows = await persistCitiesImport(rows);

    res.status(201).json({
      message: 'Import successful',
      affectedRows,
    });
  } catch (e) {
    handleServiceError(e, res, next);
  }
});
