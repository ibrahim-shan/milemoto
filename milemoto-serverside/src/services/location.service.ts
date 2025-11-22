import type {
  CreateCountryDto,
  UpdateCountryDto,
  ListQueryDto,
  CreateStateDto,
  UpdateStateDto,
  CreateCityDto,
  UpdateCityDto,
  ImportCountryRows,
} from '../routes/admin/location.helpers.js';
import { pool } from '../db/pool.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

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

// ==== Countries =================================================

export async function createCountry(data: CreateCountryDto) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO countries (name, code, status) VALUES (?, ?, ?)',
      [data.name, data.code, data.status]
    );
    return { id: result.insertId, ...data };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCountry', 'Country code already exists.');
    }
    throw err;
  }
}

export async function listCountries(params: ListQueryDto) {
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
    `SELECT COUNT(id) as totalCount FROM countries ${whereSql}`,
    queryParams
  );
  const totalCount = countRows[0]?.totalCount || 0;

  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, code, status, created_at, updated_at
       FROM countries
       ${whereSql}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
    queryParams
  );
  return { items, totalCount };
}

export async function updateCountry(id: number, body: UpdateCountryDto) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const fields: string[] = [];
    const values: (string | number)[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE countries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'Country not found');
    }

    if (body.status === 'inactive') {
      await conn.query(`UPDATE states SET status_effective = 'inactive' WHERE country_id = ?`, [
        id,
      ]);
      await conn.query(
        `UPDATE cities c
           JOIN states s ON c.state_id = s.id
         SET c.status_effective = 'inactive'
       WHERE s.country_id = ?`,
        [id]
      );
    } else if (body.status === 'active') {
      await conn.query(
        `UPDATE states
            SET status_effective = CASE WHEN status = 'active' THEN 'active' ELSE 'inactive' END
          WHERE country_id = ?`,
        [id]
      );
      await conn.query(
        `UPDATE cities c
           JOIN states s ON c.state_id = s.id
         SET c.status_effective =
           CASE
             WHEN c.status = 'active' AND s.status_effective = 'active' THEN 'active'
             ELSE 'inactive'
           END
       WHERE s.country_id = ?`,
        [id]
      );
    }

    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM countries WHERE id = ?', [id]);
    await conn.commit();
    return rows[0];
  } catch (err) {
    await conn.rollback();
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCountry', 'Country code already exists.');
    }
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteCountry(id: number) {
  try {
    // Check if country is used in shipping area rates
    const [shippingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM shipping_area_rates WHERE country_id = ? LIMIT 1',
      [id]
    );

    if (shippingRows.length > 0) {
      throw httpError(
        400,
        'DeleteFailed',
        'Cannot delete country. It is being used in shipping area rates.'
      );
    }

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM countries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'Country not found');
    }
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'ER_ROW_IS_REFERENCED_2'
    ) {
      throw httpError(
        400,
        'DeleteFailed',
        'Cannot delete country. It is already linked to existing states.'
      );
    }
    throw err;
  }
}

export async function listAllCountries(includeInactive: boolean) {
  const sql = includeInactive
    ? 'SELECT id, name, status FROM countries ORDER BY name ASC'
    : "SELECT id, name, status FROM countries WHERE status = 'active' ORDER BY name ASC";
  const [items] = await pool.query<RowDataPacket[]>(sql);
  return items;
}

export async function exportCountries() {
  const [rows] = await pool.query('SELECT name, code, status FROM countries');
  return rows;
}

export async function importCountries(rows: ImportCountryRows) {
  if (!rows.length) {
    throw httpError(400, 'EmptyFile', 'Import file is empty');
  }
  const values = rows.map((row) => [row.name, row.code, row.status]);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO countries (name, code, status) VALUES ?
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         status = VALUES(status)`,
      [values]
    );
    return result.affectedRows;
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCountry', 'Country code already exists.');
    }
    throw err;
  }
}

// ==== States ====================================================

export async function createState(data: CreateStateDto) {
  try {
    const [countryRows] = await pool.query<RowDataPacket[]>(
      'SELECT name, status FROM countries WHERE id = ? LIMIT 1',
      [data.country_id]
    );
    const country = countryRows[0];
    if (!country) throw httpError(404, 'ParentNotFound', 'Country not found');
    if (data.status === 'active' && country.status !== 'active') {
      throw httpError(
        400,
        'ParentInactive',
        'Cannot activate state because the parent country is inactive.'
      );
    }
    const statusEffective =
      data.status === 'active' && country.status === 'active' ? 'active' : 'inactive';
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO states (name, country_id, status, status_effective) VALUES (?, ?, ?, ?)',
      [data.name, data.country_id, data.status, statusEffective]
    );
    return {
      id: result.insertId,
      ...data,
      status_effective: statusEffective,
      country_name: country.name,
      country_status: country.status,
      country_status_effective: country.status,
    };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateState', 'State name already exists for this country.');
    }
    throw err;
  }
}

export async function listStates(params: ListQueryDto & { countryId?: number | undefined }) {
  const { search, page, limit, countryId } = params;
  const offset = (page - 1) * limit;
  const queryParams: (string | number)[] = [];
  const whereClauses = [];

  if (countryId) {
    // Check if number is present
    whereClauses.push('c.id = ?');
    // We pass the number directly to the database driver here
    queryParams.push(countryId);
  }
  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push('(s.name LIKE ? OR c.name LIKE ?)');
    queryParams.push(searchPattern, searchPattern);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const baseQuery = 'FROM states s JOIN countries c ON s.country_id = c.id';

  const countParams = [...queryParams];

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(s.id) as totalCount ${baseQuery} ${whereSql}`,
    countParams
  );

  const totalCount = countRows[0]?.totalCount || 0;

  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT
         s.id,
         s.name,
         s.status,
         s.status_effective,
         s.created_at,
         s.updated_at,
         c.id AS country_id,
         c.name AS country_name,
         c.status AS country_status,
         c.status AS country_status_effective
       ${baseQuery}
       ${whereSql}
       ORDER BY s.name ASC
       LIMIT ? OFFSET ?`,
    queryParams
  );
  return { items, totalCount };
}

export async function updateState(id: number, body: UpdateStateDto) {
  try {
    const [existingRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, country_id, status FROM states WHERE id = ? LIMIT 1`,
      [id]
    );
    const existing = existingRows[0];
    if (!existing) throw httpError(404, 'NotFound', 'State not found');

    const targetCountryId = body.country_id ?? Number(existing.country_id);
    const targetStatus = body.status ?? existing.status;

    const [countryRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, status FROM countries WHERE id = ? LIMIT 1`,
      [targetCountryId]
    );
    const country = countryRows[0];
    if (!country) throw httpError(404, 'ParentNotFound', 'Country not found');
    if (targetStatus === 'active' && country.status !== 'active') {
      throw httpError(
        400,
        'ParentInactive',
        'Cannot activate state because the parent country is inactive.'
      );
    }

    const fields: string[] = [];
    const values: (string | number)[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    const stateEffective =
      targetStatus === 'active' && country.status === 'active' ? 'active' : 'inactive';
    fields.push('status_effective = ?');
    values.push(stateEffective);
    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE states SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'State not found');
    }

    if (stateEffective === 'inactive') {
      await pool.query(`UPDATE cities SET status_effective = 'inactive' WHERE state_id = ?`, [id]);
    } else {
      await pool.query(
        `UPDATE cities
            SET status_effective = CASE WHEN status = 'active' THEN 'active' ELSE 'inactive' END
          WHERE state_id = ?`,
        [id]
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         s.id,
         s.name,
         s.status,
         s.status_effective,
         s.country_id,
         c.name AS country_name,
         c.status AS country_status,
         c.status AS country_status_effective
       FROM states s
       JOIN countries c ON c.id = s.country_id
      WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateState', 'State name already exists for this country.');
    }
    throw err;
  }
}

export async function deleteState(id: number) {
  try {
    // Check if state is used in shipping area rates
    const [shippingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM shipping_area_rates WHERE state_id = ? LIMIT 1',
      [id]
    );

    if (shippingRows.length > 0) {
      throw httpError(
        400,
        'DeleteFailed',
        'Cannot delete state. It is being used in shipping area rates.'
      );
    }

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM states WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'State not found');
    }
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'ER_ROW_IS_REFERENCED_2'
    ) {
      throw httpError(
        400,
        'DeleteFailed',
        'Cannot delete state. It is already linked to existing cities.'
      );
    }
    throw err;
  }
}

export async function listAllStates() {
  const [items] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, country_id, status, status_effective FROM states WHERE status_effective = 'active' ORDER BY name ASC"
  );
  return items;
}

export async function exportStates() {
  const [rows] = await pool.query(
    `SELECT s.name, c.code as country_code, s.status
       FROM states s
       JOIN countries c ON s.country_id = c.id`
  );
  return rows;
}

type StateImportRow = {
  name: string;
  country_code: string;
  status: 'active' | 'inactive';
};

export async function importStates(rows: StateImportRow[]) {
  if (!rows.length) {
    throw httpError(400, 'EmptyFile', 'Import file is empty');
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [countryRows] = await conn.query<RowDataPacket[]>(
      'SELECT id, code, status FROM countries WHERE code IN (?)',
      [rows.map((r) => r.country_code)]
    );
    const countryMap = new Map(
      countryRows.map((r) => [
        r.code,
        { id: Number(r.id), status: r.status as 'active' | 'inactive' },
      ])
    );

    const values = rows.map((row) => {
      const country = countryMap.get(row.country_code);
      if (!country) {
        throw httpError(400, 'InvalidReference', `Invalid country_code: ${row.country_code}`);
      }
      const statusEffective =
        row.status === 'active' && country.status === 'active' ? 'active' : 'inactive';
      return [row.name, country.id, row.status, statusEffective];
    });

    const [result] = await conn.query<ResultSetHeader>(
      'INSERT INTO states (name, country_id, status, status_effective) VALUES ?',
      [values]
    );
    await conn.commit();
    return result.affectedRows;
  } catch (err) {
    await conn.rollback();
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateState', 'State name already exists for this country.');
    }
    throw err;
  } finally {
    conn.release();
  }
}

// ==== Cities ====================================================

export async function createCity(data: CreateCityDto) {
  try {
    const [stateRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         s.id,
         s.name,
         s.status,
         s.status_effective,
         c.id AS country_id,
         c.name AS country_name,
         c.status AS country_status
         FROM states s
         JOIN countries c ON c.id = s.country_id
        WHERE s.id = ? LIMIT 1`,
      [data.state_id]
    );
    const parentState = stateRows[0];
    if (!parentState) throw httpError(404, 'ParentNotFound', 'State not found');
    if (
      data.status === 'active' &&
      (parentState.status !== 'active' || parentState.country_status !== 'active')
    ) {
      throw httpError(
        400,
        'ParentInactive',
        'Cannot activate city because the parent state or country is inactive.'
      );
    }

    const parentStateEffective =
      parentState.status_effective ??
      (parentState.status === 'active' && parentState.country_status === 'active'
        ? 'active'
        : 'inactive');
    const statusEffective =
      data.status === 'active' && parentStateEffective === 'active' ? 'active' : 'inactive';

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO cities (name, state_id, status, status_effective) VALUES (?, ?, ?, ?)',
      [data.name, data.state_id, data.status, statusEffective]
    );
    return {
      id: result.insertId,
      ...data,
      status_effective: statusEffective,
      state_name: parentState.name,
      state_status: parentState.status,
      state_status_effective: parentStateEffective,
      country_id: parentState.country_id,
      country_name: parentState.country_name,
      country_status: parentState.country_status,
      country_status_effective: parentState.country_status,
    };
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCity', 'City name already exists for this state.');
    }
    throw err;
  }
}

export async function listAllCities(stateId?: number) {
  let sql =
    "SELECT id, name, state_id, status, status_effective FROM cities WHERE status_effective = 'active'";
  const params: unknown[] = [];

  if (stateId) {
    sql += ' AND state_id = ?';
    params.push(stateId);
  }

  sql += ' ORDER BY name ASC';

  const [items] = await pool.query<RowDataPacket[]>(sql, params);
  return items;
}

export async function listCities(params: ListQueryDto & { stateId?: number | undefined }) {
  const { search, page, limit, stateId } = params;
  const offset = (page - 1) * limit;
  const queryParams: (string | number)[] = [];
  const whereClauses = [];

  if (stateId) {
    whereClauses.push('s.id = ?');
    queryParams.push(stateId);
  }

  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push('(ci.name LIKE ? OR s.name LIKE ? OR co.name LIKE ?)');
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }
  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const baseQuery = `
       FROM cities ci
       JOIN states s ON ci.state_id = s.id
       JOIN countries co ON s.country_id = co.id
    `;

  const countParams = [...queryParams];

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(ci.id) as totalCount ${baseQuery} ${whereSql}`,
    countParams
  );

  const totalCount = countRows[0]?.totalCount || 0;

  queryParams.push(limit, offset);
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT
         ci.id,
         ci.name,
         ci.status,
         ci.status_effective,
         ci.created_at,
         s.id AS state_id,
         s.name AS state_name,
         s.status AS state_status,
         s.status_effective AS state_status_effective,
         co.id AS country_id,
         co.name AS country_name,
         co.status AS country_status,
         co.status AS country_status_effective
       ${baseQuery}
       ${whereSql}
       ORDER BY ci.name ASC
       LIMIT ? OFFSET ?`,
    queryParams
  );
  return { items, totalCount };
}

export async function updateCity(id: number, body: UpdateCityDto) {
  try {
    const [existingRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, state_id, status FROM cities WHERE id = ? LIMIT 1`,
      [id]
    );
    const existing = existingRows[0];
    if (!existing) throw httpError(404, 'NotFound', 'City not found');

    const targetStateId = body.state_id ?? Number(existing.state_id);
    const targetStatus = body.status ?? existing.status;

    const [stateRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         s.id,
         s.name,
         s.status,
         s.status_effective,
         c.id AS country_id,
         c.name AS country_name,
         c.status AS country_status
         FROM states s
         JOIN countries c ON c.id = s.country_id
        WHERE s.id = ? LIMIT 1`,
      [targetStateId]
    );
    const parentState = stateRows[0];
    if (!parentState) throw httpError(404, 'ParentNotFound', 'State not found');
    if (
      targetStatus === 'active' &&
      (parentState.status !== 'active' || parentState.country_status !== 'active')
    ) {
      throw httpError(
        400,
        'ParentInactive',
        'Cannot activate city because the parent state or country is inactive.'
      );
    }

    const parentStateEffective =
      parentState.status_effective ??
      (parentState.status === 'active' && parentState.country_status === 'active'
        ? 'active'
        : 'inactive');
    const cityEffective =
      targetStatus === 'active' && parentStateEffective === 'active' ? 'active' : 'inactive';

    const fields: string[] = [];
    const values: (string | number)[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    fields.push('status_effective = ?');
    values.push(cityEffective);
    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE cities SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'City not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         ci.id,
         ci.name,
         ci.status,
         ci.status_effective,
         ci.state_id,
         s.name AS state_name,
         s.status AS state_status,
         s.status_effective AS state_status_effective,
         co.id AS country_id,
         co.name AS country_name,
         co.status AS country_status,
         co.status AS country_status_effective
       FROM cities ci
       JOIN states s ON s.id = ci.state_id
       JOIN countries co ON co.id = s.country_id
      WHERE ci.id = ?`,
      [id]
    );
    return rows[0];
  } catch (err) {
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCity', 'City name already exists for this state.');
    }
    throw err;
  }
}

export async function deleteCity(id: number) {
  try {
    // Check if city is used in shipping area rates
    const [shippingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM shipping_area_rates WHERE city_id = ? LIMIT 1',
      [id]
    );

    if (shippingRows.length > 0) {
      throw httpError(
        400,
        'DeleteFailed',
        'Cannot delete city. It is being used in shipping area rates.'
      );
    }

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM cities WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw httpError(404, 'NotFound', 'City not found');
    }
  } catch (err) {
    throw err;
  }
}

export async function exportCities() {
  const [rows] = await pool.query(
    `SELECT ci.name, s.name as state_name, c.code as country_code, ci.status
       FROM cities ci
       JOIN states s ON ci.state_id = s.id
       JOIN countries c ON s.country_id = c.id`
  );
  return rows;
}

type CityImportRow = {
  name: string;
  state_name: string;
  country_code: string;
  status: 'active' | 'inactive';
};

export async function importCities(rows: CityImportRow[]) {
  if (!rows.length) {
    throw httpError(400, 'EmptyFile', 'Import file is empty');
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [stateRows] = await conn.query<RowDataPacket[]>(
      `SELECT s.id, s.name, s.status, s.status_effective, c.code, c.status AS country_status
       FROM states s
       JOIN countries c ON s.country_id = c.id`
    );
    const stateMap = new Map(
      stateRows.map((r) => [
        `${r.name}|${r.code}`,
        {
          id: Number(r.id),
          status: r.status as 'active' | 'inactive',
          statusEffective: (r.status_effective as 'active' | 'inactive' | null) ?? null,
          countryStatus: r.country_status as 'active' | 'inactive',
        },
      ])
    );

    const values = rows.map((row) => {
      const state = stateMap.get(`${row.state_name}|${row.country_code}`);
      if (!state) {
        throw httpError(
          400,
          'InvalidReference',
          `Invalid combo: state=${row.state_name}, country=${row.country_code}`
        );
      }
      const parentEffective =
        state.statusEffective ??
        (state.status === 'active' && state.countryStatus === 'active' ? 'active' : 'inactive');
      const statusEffective =
        row.status === 'active' && parentEffective === 'active' ? 'active' : 'inactive';
      return [row.name, state.id, row.status, statusEffective];
    });

    const [result] = await conn.query<ResultSetHeader>(
      'INSERT INTO cities (name, state_id, status, status_effective) VALUES ?',
      [values]
    );
    await conn.commit();
    return result.affectedRows;
  } catch (err) {
    await conn.rollback();
    if (isDuplicateEntry(err)) {
      throw httpError(409, 'DuplicateCity', 'City name already exists for this state.');
    }
    throw err;
  } finally {
    conn.release();
  }
}
