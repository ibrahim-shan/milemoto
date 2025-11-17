// src/lib/api.ts
// Ensure API base points to /api/v1
// Prefer same-origin relative API base for dev; proxy via Next.js rewrites
import { getAccessToken, setAccessToken } from './authStorage';

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') || '/api';
export const API_BASE = RAW_BASE.endsWith('/api')
  ? `${RAW_BASE}/v1`
  : RAW_BASE.includes('/api/v1')
    ? RAW_BASE
    : `${RAW_BASE}/v1`;

type RequestInitWithTimeout = RequestInit & { timeout?: number };

function mergeHeaders(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  const out: Record<string, string> = {};
  new Headers(h).forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function withAuth(init?: RequestInitWithTimeout): RequestInitWithTimeout {
  const auth = authHeader();
  if (!Object.keys(auth).length) {
    return init ?? {};
  }
  const headers = { ...mergeHeaders(init?.headers), ...auth };
  return { ...(init ?? {}), headers };
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

async function request<T>(
  path: string,
  init: RequestInitWithTimeout,
  triedRefresh = false,
): Promise<T> {
  const headers = { ...mergeHeaders(init.headers) };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeout ?? DEFAULT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers,
      signal: init.signal ?? controller.signal,
    });
  } catch (e: unknown) {
    // Check if e is an object with a 'name' property
    if (e && typeof e === 'object' && 'name' in e && e.name === 'AbortError') {
      // --- FIX 5 & 6 (Lines 62-63): Cast the new error to add properties safely ---
      const err = new Error('Request timed out') as Error & { status?: number; code?: string };
      err.status = 0;
      err.code = 'Timeout';
      clearTimeout(timeout);
      throw err;
    }
    clearTimeout(timeout);
    throw e;
  } finally {
    // ensure timeout cleared if fetch resolves or throws synchronously
  }
  clearTimeout(timeout);
  const ct = res.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    // On 401, attempt a single refresh then retry (except when calling refresh itself)
    if (res.status === 401 && !triedRefresh && !path.startsWith('/auth/refresh')) {
      const newTok = await refreshAccessToken();
      if (newTok) {
        const retryHeaders = { ...headers, Authorization: `Bearer ${newTok}` };
        return request<T>(path, { ...init, headers: retryHeaders }, true);
      }
    }
    const code = body?.code || body?.error || res.statusText;
    const msg = body?.message || body?.error || res.statusText;
    const err = new Error(msg);
    if (err instanceof Error) {
      Object.assign(err, {
        status: res.status,
        details: body?.details,
        code,
        error: body?.error,
      });
    }
    throw err;
  }
  return body as T;
}

export const post = <OkResponseDto>(
  path: string,
  body?: unknown,
  init?: RequestInitWithTimeout,
) => {
  let payload: BodyInit | undefined;
  let headers: HeadersInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers = { 'Content-Type': 'application/json', ...mergeHeaders(init?.headers) };
  }
  const baseInit: RequestInitWithTimeout = { ...(init || {}), method: 'POST' };
  const finalHeaders = headers ?? init?.headers;
  const finalInit: RequestInitWithTimeout = {
    ...baseInit,
    ...(payload !== undefined ? { body: payload } : {}),
    ...(finalHeaders ? { headers: finalHeaders } : {}),
  };
  return request<OkResponseDto>(path, finalInit);
};

export const get = <OkResponseDto>(path: string, init: RequestInitWithTimeout = {}) =>
  request<OkResponseDto>(path, { method: 'GET', ...init });

export const put = <OkResponseDto>(path: string, body?: unknown, init?: RequestInitWithTimeout) => {
  let payload: BodyInit | undefined;
  let headers: HeadersInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers = { 'Content-Type': 'application/json', ...mergeHeaders(init?.headers) };
  }
  const baseInit: RequestInitWithTimeout = { ...(init || {}), method: 'PUT' };
  const finalHeaders = headers ?? init?.headers;
  const finalInit: RequestInitWithTimeout = {
    ...baseInit,
    ...(payload !== undefined ? { body: payload } : {}),
    ...(finalHeaders ? { headers: finalHeaders } : {}),
  };
  return request<OkResponseDto>(path, finalInit);
};

export const del = <OkResponseDto>(path: string, init: RequestInitWithTimeout = {}) =>
  request<OkResponseDto>(path, { method: 'DELETE', ...init });

export const authorizedGet = <OkResponseDto>(path: string, init?: RequestInitWithTimeout) =>
  get<OkResponseDto>(path, withAuth(init));

export const authorizedPost = <OkResponseDto>(
  path: string,
  body?: unknown,
  init?: RequestInitWithTimeout,
) => post<OkResponseDto>(path, body, withAuth(init));

export const authorizedPut = <OkResponseDto>(
  path: string,
  body?: unknown,
  init?: RequestInitWithTimeout,
) => put<OkResponseDto>(path, body, withAuth(init));

export const authorizedDel = <OkResponseDto>(path: string, init?: RequestInitWithTimeout) =>
  del<OkResponseDto>(path, withAuth(init));
