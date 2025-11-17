// src/lib/authStorage.ts
import type { UserDto } from '@/types';

type AuthListener = () => void;

let accessToken: string | null = null;
let currentUser: UserDto | null = null;
const listeners = new Set<AuthListener>();

const channel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('mm:auth')
    : null;

function emitLocal() {
  listeners.forEach(listener => listener());
}

function broadcastState() {
  channel?.postMessage({ accessToken, user: currentUser });
}

if (channel) {
  channel.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { accessToken?: string | null; user?: UserDto | null } | undefined;
    if (!data || typeof data !== 'object') return;
    accessToken = data.accessToken ?? null;
    currentUser = data.user ?? null;
    emitLocal();
  });
}

function notify() {
  emitLocal();
  broadcastState();
}

export function subscribe(listener: AuthListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  notify();
}

export function getUser<T = UserDto>(): T | null {
  return (currentUser as T | null) ?? null;
}

export function setUser(user: UserDto | null) {
  currentUser = user;
  notify();
}

export function applyLoginResult(payload: { accessToken: string; user: UserDto }) {
  accessToken = payload.accessToken;
  currentUser = payload.user;
  notify();
}

export function clearAuth() {
  accessToken = null;
  currentUser = null;
  notify();
}
