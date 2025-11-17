import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') || 'http://localhost:4000/api';
const API_BASE = RAW_API_BASE.endsWith('/api')
  ? `${RAW_API_BASE}/v1`
  : RAW_API_BASE.includes('/api/v1')
    ? RAW_API_BASE
    : `${RAW_API_BASE}/v1`;

type GuardResult = { redirect?: NextResponse; setCookie?: string | null };

async function ensureAuthenticated(req: NextRequest): Promise<GuardResult> {
  const loginUrl = new URL('/signin', req.url);
  loginUrl.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);

  if (!req.cookies.get('mm_refresh')) {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  let refreshRes: Response;
  try {
    refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
  } catch {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  if (!refreshRes.ok) {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  const setCookie = refreshRes.headers.get('set-cookie');
  return { setCookie };
}

async function ensureAdmin(req: NextRequest): Promise<GuardResult> {
  const loginUrl = new URL('/signin', req.url);
  loginUrl.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  const accountUrl = new URL('/account', req.url);

  if (!req.cookies.get('mm_refresh')) {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  let refreshRes: Response;
  try {
    refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
  } catch {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  if (!refreshRes.ok) {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  const data = (await refreshRes.json()) as { accessToken?: string } | undefined;
  const token = data?.accessToken;
  if (!token) {
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  const payload = decodeJwt(token);
  if (!payload || payload.role !== 'admin') {
    return { redirect: NextResponse.redirect(accountUrl) };
  }

  const setCookie = refreshRes.headers.get('set-cookie');
  return { setCookie };
}

function decodeJwt(token: string) {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payloadPart = parts[1];
  if (!payloadPart) return null;
  try {
    const payload = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const json = atob(payload);
    return JSON.parse(json) as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  let setCookie: string | null = null;
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/admin')) {
    const guard = await ensureAdmin(req);
    if (guard.redirect) return guard.redirect;
    setCookie = guard.setCookie ?? null;
  } else if (pathname === '/account' || pathname.startsWith('/account/')) {
    const guard = await ensureAuthenticated(req);
    if (guard.redirect) return guard.redirect;
    setCookie = guard.setCookie ?? null;
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (setCookie) {
    res.headers.append('Set-Cookie', setCookie);
  }

  const isProd = process.env.NODE_ENV === 'production';

  let apiOrigin: string;
  try {
    apiOrigin = new URL(API_BASE).origin;
  } catch {
    apiOrigin = 'http://localhost:4000';
  }

  const ga1 = 'https://www.googletagmanager.com';
  const ga2 = 'https://www.google-analytics.com';
  const self = "'self'";

  const scriptExtras = [!isProd && "'unsafe-eval'"].filter(Boolean).join(' ');
  const connectExtras = [!isProd && 'ws:', !isProd && 'wss:'].filter(Boolean).join(' ');

  const parts = [
    `default-src ${self}`,
    `base-uri ${self}`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `form-action ${self}`,
    `script-src ${self} 'nonce-${nonce}' 'unsafe-inline' ${ga1} ${ga2}${scriptExtras ? ' ' + scriptExtras : ''}`,
    `style-src ${self} 'unsafe-inline'`,
    `img-src ${self} data: ${ga1} ${ga2}`,
    `font-src ${self} data:`,
    `connect-src ${self} ${apiOrigin} ${ga1} ${ga2}${connectExtras ? ' ' + connectExtras : ''}`,
  ];

  if (isProd) {
    parts.push('upgrade-insecure-requests');
  }

  const csp = parts.join('; ');
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('x-nonce', nonce);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
