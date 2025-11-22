import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import type { CreateTaxDto, UpdateTaxDto, ListQueryDto } from '../routes/admin/tax.helpers.js';

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

export async function createTax(data: CreateTaxDto) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO taxes (name, rate, type, status, country_code, state_code) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.rate, data.type, data.status, data.country_code, data.state_code]
    );
    return { id: result.insertId, ...data };
  } catch (err) {
    // Duplicate entry usually won't happen unless we enforce unique names,
    // but keeping the pattern is good practice.
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateTax', 'Tax entry already exists.');
    }
    throw err;
  }
}

export async function listTaxes(params: ListQueryDto) {
  const { search, page, limit } = params;
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const queryParams: (string | number)[] = [];

  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push('(name LIKE ? OR country_code LIKE ?)');
    queryParams.push(searchPattern, searchPattern);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count for pagination
  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(id) as totalCount FROM taxes ${whereSql}`,
    queryParams
  );
  const totalCount = countRows[0]?.totalCount || 0;

  // Get paginated items
  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, rate, type, status, country_code, state_code, created_at, updated_at
       FROM taxes
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    queryParams
  );

  // Convert string decimals to numbers if necessary (MySQL driver sometimes returns strings)
  const formattedItems = items.map((item) => ({
    ...item,
    rate: Number(item.rate),
  }));

  return { items: formattedItems, totalCount };
}

export async function updateTax(id: number, body: UpdateTaxDto) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM taxes WHERE id = ?', [id]);
    if (!rows[0]) throw httpError(404, 'NotFound', 'Tax not found');
    return { ...rows[0], rate: Number(rows[0].rate) };
  }

  values.push(id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE taxes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'Tax not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM taxes WHERE id = ?', [id]);
    if (!rows[0]) {
      throw httpError(404, 'NotFound', 'Tax not found after update');
    }
    return { ...rows[0], rate: Number(rows[0].rate) };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateTax', 'Tax entry already exists.');
    }
    throw err;
  }
}

export async function deleteTax(id: number) {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM taxes WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw httpError(404, 'NotFound', 'Tax not found');
  }
}
