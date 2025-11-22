import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import type { CreateCurrencyDto, UpdateCurrencyDto } from '@milemoto/types';
import { ListQueryDto } from '../routes/admin/currency.helpers.js';

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

// Helper function to format currency row
function formatCurrencyRow(row: RowDataPacket) {
  return {
    ...row,
    exchangeRate: Number(row.exchange_rate),
    exchange_rate: undefined,
  };
}

// ==== CRUD Operations ==========================================

export async function createCurrency(data: CreateCurrencyDto) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO currencies (name, code, symbol, exchange_rate, status) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.code, data.symbol, data.exchangeRate, data.status]
    );
    return { id: result.insertId, ...data };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCurrency', 'Currency code already exists.');
    }
    throw err;
  }
}

export async function listCurrencies(params: ListQueryDto) {
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

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(id) as totalCount FROM currencies ${whereSql}`,
    queryParams
  );
  const totalCount = countRows[0]?.totalCount || 0;

  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, code, symbol, exchange_rate, status, created_at, updated_at
       FROM currencies
       ${whereSql}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
    queryParams
  );

  const formattedItems = items.map((item) => ({
    ...item,
    exchangeRate: Number(item.exchange_rate),
    exchange_rate: undefined,
  }));

  return { items: formattedItems, totalCount };
}

export async function updateCurrency(id: number, body: UpdateCurrencyDto) {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      // Map camelCase DTO to snake_case DB column if needed, though only exchangeRate differs
      const dbKey = key === 'exchangeRate' ? 'exchange_rate' : key;
      fields.push(`${dbKey} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM currencies WHERE id = ?', [id]);
    const row = getFirstRow(rows);
    return formatCurrencyRow(row);
  }

  values.push(id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE currencies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'Currency not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM currencies WHERE id = ?', [id]);
    const row = getFirstRow(rows);
    return formatCurrencyRow(row);
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCurrency', 'Currency code already exists.');
    }
    throw err;
  }
}

export async function deleteCurrency(id: number) {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM currencies WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw httpError(404, 'NotFound', 'Currency not found');
  }
}

export async function listAllCurrencies(includeInactive: boolean) {
  const sql = includeInactive
    ? 'SELECT id, name, code, symbol, exchange_rate, status FROM currencies ORDER BY name ASC'
    : "SELECT id, name, code, symbol, exchange_rate, status FROM currencies WHERE status = 'active' ORDER BY name ASC";

  const [items] = await pool.query<RowDataPacket[]>(sql);

  return items.map((item) => ({
    ...item,
    exchangeRate: Number(item.exchange_rate),
    exchange_rate: undefined,
  }));
}
