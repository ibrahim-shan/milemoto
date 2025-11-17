import type { RowDataPacket } from 'mysql2';
import { env } from './env.js';
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';

type FlagKey = 'trustedDeviceFpEnforceAll';

const defaults: Record<FlagKey, boolean> = {
  trustedDeviceFpEnforceAll: env.TRUSTED_DEVICE_FINGERPRINT_ENABLED,
};

// Mutable runtime flags that can be flipped without redeploy via admin endpoints
export const runtimeFlags: Record<FlagKey, boolean> = { ...defaults };

export async function loadRuntimeFlags(): Promise<void> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT flag_key, bool_value FROM runtime_flags'
    );
    for (const row of rows) {
      const key = row.flag_key as FlagKey;
      if (key && key in runtimeFlags) {
        runtimeFlags[key] = Boolean(row.bool_value);
      }
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to load runtime flags; using defaults');
  }
}

export async function persistRuntimeFlag(key: FlagKey, value: boolean): Promise<void> {
  await pool.query(
    `INSERT INTO runtime_flags (flag_key, bool_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE bool_value = VALUES(bool_value), updated_at = CURRENT_TIMESTAMP`,
    [key, value ? 1 : 0]
  );
  runtimeFlags[key] = value;
}
