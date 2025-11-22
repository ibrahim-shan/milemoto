import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import type {
  UpdateShippingMethodDto,
  CreateAreaRateDto,
  UpdateAreaRateDto,
} from '@milemoto/types';
import { ListQueryDto } from '../routes/admin/shipping.helpers.js';

type ServiceError = Error & { status?: number; code?: string };

function httpError(status: number, code: string, message: string): ServiceError {
  const err = new Error(message) as ServiceError;
  err.status = status;
  err.code = code;
  return err;
}

function isDuplicateEntry(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'ER_DUP_ENTRY'
  );
}

// Helper function to safely get first row
function getFirstRow<T>(rows: T[]): T {
  if (!rows[0]) {
    throw httpError(404, 'NotFound', 'Record not found');
  }
  return rows[0];
}

// ==== Shipping Methods (Global) ================================

export async function listShippingMethods() {
  const [items] = await pool.query<RowDataPacket[]>(
    'SELECT id, code, name, status, cost, updated_at FROM shipping_methods ORDER BY id ASC'
  );
  // Ensure cost is a number
  return items.map((item) => ({
    ...item,
    cost: item.cost ? Number(item.cost) : null,
  }));
}

export async function updateShippingMethod(code: string, data: UpdateShippingMethodDto) {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.status) {
    fields.push('status = ?');
    values.push(data.status);
  }

  // Allow updating cost for 'flat_rate' and 'area_wise'
  if (data.cost !== undefined && (code === 'flat_rate' || code === 'area_wise')) {
    fields.push('cost = ?');
    values.push(data.cost);
  }

  if (fields.length === 0) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM shipping_methods WHERE code = ?',
      [code]
    );
    const row = getFirstRow(rows);
    return { ...row, cost: row.cost ? Number(row.cost) : null };
  }

  values.push(code);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE shipping_methods SET ${fields.join(', ')} WHERE code = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw httpError(404, 'NotFound', 'Shipping method not found');
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM shipping_methods WHERE code = ?',
    [code]
  );
  const row = getFirstRow(rows);
  return { ...row, cost: row.cost ? Number(row.cost) : null };
}

// ==== Area Wise Rates ==========================================

export async function createAreaRate(data: CreateAreaRateDto) {
  try {
    // Check for duplicates manually because UNIQUE constraint allows multiple NULLs
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM shipping_area_rates WHERE country_id = ? AND state_id <=> ? AND city_id <=> ?',
      [data.country_id, data.state_id || null, data.city_id || null]
    );

    if (existing.length > 0) {
      throw httpError(
        409,
        'DuplicateRate',
        'A shipping rate for this specific location already exists.'
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO shipping_area_rates (country_id, state_id, city_id, cost) VALUES (?, ?, ?, ?)',
      [data.country_id, data.state_id || null, data.city_id || null, data.cost]
    );

    // Fetch the complete record with joins to return to frontend
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id, r.cost,
        c.name as country_name,
        s.name as state_name,
        ci.name as city_name
       FROM shipping_area_rates r
       JOIN countries c ON r.country_id = c.id
       LEFT JOIN states s ON r.state_id = s.id
       LEFT JOIN cities ci ON r.city_id = ci.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    const row = getFirstRow(rows);

    return {
      ...data,
      id: result.insertId,
      ...row,
      cost: Number(row.cost),
    };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(
        409,
        'DuplicateRate',
        'A shipping rate for this specific location already exists.'
      );
    }
    throw err;
  }
}

export async function listAreaRates(params: ListQueryDto) {
  const { search, page, limit } = params;
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const queryParams: (string | number)[] = [];

  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push('(c.name LIKE ? OR s.name LIKE ? OR ci.name LIKE ?)');
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const baseQuery = `
    FROM shipping_area_rates r
    JOIN countries c ON r.country_id = c.id
    LEFT JOIN states s ON r.state_id = s.id
    LEFT JOIN cities ci ON r.city_id = ci.id
  `;

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(r.id) as totalCount ${baseQuery} ${whereSql}`,
    queryParams
  );
  const totalCount = countRows[0]?.totalCount || 0;

  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT 
        r.id, r.cost, r.country_id, r.state_id, r.city_id,
        c.name as country_name,
        s.name as state_name,
        ci.name as city_name
       ${baseQuery}
       ${whereSql}
       ORDER BY c.name ASC, s.name ASC, ci.name ASC
       LIMIT ? OFFSET ?`,
    queryParams
  );

  const formattedItems = items.map((item) => ({
    ...item,
    cost: Number(item.cost),
  }));

  return { items: formattedItems, totalCount };
}

export async function updateAreaRate(id: number, body: UpdateAreaRateDto) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  // Only allow updating cost for now, as changing location IDs is effectively a new rule
  if (body.cost !== undefined) {
    fields.push('cost = ?');
    values.push(body.cost);
  }

  if (fields.length === 0) {
    // Just return existing
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM shipping_area_rates WHERE id = ?',
      [id]
    );
    const row = getFirstRow(rows);
    return { ...row, cost: Number(row.cost) };
  }

  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE shipping_area_rates SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw httpError(404, 'NotFound', 'Rate not found');
  }

  return { id, cost: body.cost };
}

export async function deleteAreaRate(id: number) {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM shipping_area_rates WHERE id = ?',
    [id]
  );
  if (result.affectedRows === 0) {
    throw httpError(404, 'NotFound', 'Rate not found');
  }
}
