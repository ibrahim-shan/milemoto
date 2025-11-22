import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import type { CreateUnitDto, UpdateUnitDto, ListQueryDto } from '../routes/admin/unit.helpers.js';

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

// ==== CRUD Operations ==========================================

export async function createUnit(data: CreateUnitDto) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO units (name, code, status) VALUES (?, ?, ?)',
      [data.name, data.code, data.status]
    );
    return { id: result.insertId, ...data };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateUnit', 'Unit code already exists.');
    }
    throw err;
  }
}

export async function listUnits(params: ListQueryDto) {
  const { search, page, limit } = params;
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const queryParams: (string | number)[] = [];

  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push('(name LIKE ? OR code LIKE ?)');
    queryParams.push(searchPattern, searchPattern);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count for pagination
  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(id) as totalCount FROM units ${whereSql}`,
    queryParams
  );
  const totalCount = countRows[0]?.totalCount || 0;

  // Get paginated items
  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, code, status, created_at, updated_at
       FROM units
       ${whereSql}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
    queryParams
  );
  return { items, totalCount };
}

export async function updateUnit(id: number, body: UpdateUnitDto) {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    // No fields to update, return existing
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM units WHERE id = ?', [id]);
    if (!rows[0]) throw httpError(404, 'NotFound', 'Unit not found');
    return rows[0];
  }

  values.push(id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE units SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'Unit not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM units WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateUnit', 'Unit code already exists.');
    }
    throw err;
  }
}

export async function deleteUnit(id: number) {
  // Check if unit is in use (optional logic: referential integrity usually handled by DB foreign keys)
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM units WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw httpError(404, 'NotFound', 'Unit not found');
  }
}

export async function listAllUnits(includeInactive: boolean) {
  const sql = includeInactive
    ? 'SELECT id, name, code, status FROM units ORDER BY name ASC'
    : "SELECT id, name, code, status FROM units WHERE status = 'active' ORDER BY name ASC";
  const [items] = await pool.query<RowDataPacket[]>(sql);
  return items;
}
