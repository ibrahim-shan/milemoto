import type { Request, Response, NextFunction } from 'express';
import type { RowDataPacket } from 'mysql2';
import { verifyAccess, verifyRefresh } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { sha256 } from '../utils/crypto.js';

const RANK = { user: 1, admin: 2 } as const;
export function requireAtLeast(min: keyof typeof RANK) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = req.user;
    if (!u) return res.status(401).json({ error: 'No token' });
    if ((RANK[u.role as keyof typeof RANK] ?? 0) < RANK[min])
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

async function authenticateViaRefreshCookie(req: Request) {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (!token) return null;
  const { sid, sub } = verifyRefresh(token);

  const [sessions] = await pool.query<RowDataPacket[]>(
    `SELECT refresh_hash, revoked_at, expires_at FROM sessions WHERE id = ? AND user_id = ? LIMIT 1`,
    [sid, sub]
  );
  const session = sessions[0];
  if (
    !session ||
    session.revoked_at ||
    new Date(session.expires_at) < new Date() ||
    sha256(token) !== session.refresh_hash
  ) {
    if (session && sha256(token) !== session.refresh_hash) {
      await pool.query(`UPDATE sessions SET revoked_at = NOW() WHERE id = ?`, [sid]);
    }
    return null;
  }

  const [users] = await pool.query<RowDataPacket[]>(`SELECT role FROM users WHERE id = ? LIMIT 1`, [
    sub,
  ]);
  const user = users[0];
  if (!user) return null;
  return { id: String(sub), role: user.role as 'user' | 'admin' };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authz = req.get('authorization') || '';
  if (authz.startsWith('Bearer ')) {
    try {
      const payload = verifyAccess(authz.slice(7));
      req.user = { id: payload.sub, role: payload.role };
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  try {
    const fallbackUser = await authenticateViaRefreshCookie(req);
    if (!fallbackUser) return res.status(401).json({ error: 'No token' });
    req.user = fallbackUser;
    return next();
  } catch (err) {
    return next(err);
  }
}

export function requireRole(role: 'admin' | 'user') {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = req.user;
    if (!u) return res.status(401).json({ error: 'No token' });
    if (u.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
