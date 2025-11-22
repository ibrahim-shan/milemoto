'use client';

import { useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';

import {
  listTrustedDevices,
  revokeAllTrustedDevices,
  revokeTrustedDevice,
  untrustCurrentDevice,
} from '@/lib/auth';
import { Button } from '@/ui/Button';

type Device = {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string | null;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  current: boolean;
};

export function TrustedDevicesCard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const activeDevices = useMemo(() => devices.filter(d => !d.revokedAt), [devices]);
  const hasCurrentDevice = useMemo(() => devices.some(d => d.current && !d.revokedAt), [devices]);

  const refreshDevices = async () => {
    setLoadingDevices(true);
    try {
      const data = await listTrustedDevices();
      setDevices(data.items);
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to load trusted devices');
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    void refreshDevices();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      await revokeTrustedDevice(id);
      toast.success('Trusted device revoked');
      await refreshDevices();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to revoke');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllTrustedDevices();
      toast.success('All trusted devices revoked');
      await refreshDevices();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to revoke all');
    }
  };

  const handleUntrustCurrent = async () => {
    if (!hasCurrentDevice) {
      toast.error('This device is not currently trusted');
      return;
    }
    try {
      await untrustCurrentDevice();
      toast.success('This device is no longer trusted');
      await refreshDevices();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to untrust device');
    }
  };

  return (
    <div className="rounded-xl border p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">Trusted Devices</h3>
          <p className="text-muted-foreground text-sm">
            Manage the browsers/devices that can bypass MFA.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={refreshDevices}
            isLoading={loadingDevices}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleUntrustCurrent}
            disabled={!hasCurrentDevice}
            title={!hasCurrentDevice ? 'This device is not currently trusted' : undefined}
          >
            Untrust current
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevokeAll}
            disabled={!activeDevices.length}
          >
            Revoke all
          </Button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        {loadingDevices ? (
          <p className="text-muted-foreground text-sm">Loading devices...</p>
        ) : activeDevices.length === 0 ? (
          <p className="text-muted-foreground text-sm">No trusted devices found.</p>
        ) : (
          <ul className="divide-y">
            {activeDevices.map(device => (
              <li
                key={device.id}
                className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{formatUA(device.userAgent)}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatIp(device.ip)} &bull; Trusted {relativeFrom(device.createdAt)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Last used {relativeFrom(device.lastUsedAt)} &bull; Expires{' '}
                    {relativeUntil(device.expiresAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleRevoke(device.id)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatIp(ip: string | null): string {
  if (!ip) return 'IP unknown';
  if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
  return ip;
}

function formatUA(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const s = ua;
  let os = 'Unknown OS';
  if (/Windows NT/i.test(s)) os = 'Windows';
  else if (/Mac OS X/i.test(s)) os = 'macOS';
  else if (/Android/i.test(s)) os = 'Android';
  else if (/(iPhone|iPad|iPod)/i.test(s)) os = 'iOS';
  else if (/Linux/i.test(s)) os = 'Linux';

  let browser = 'Browser';
  let ver: string | null = null;
  const verOf = (marker: string): string | null => {
    const m = s.match(new RegExp(marker.replace('/', '\\/') + '(\\d+)'));
    return m && m[1] ? m[1] : null;
  };

  if (/Edg\//.test(s)) {
    browser = 'Edge';
    ver = verOf('Edg/');
  } else if (/Chrome\//.test(s)) {
    browser = 'Chrome';
    ver = verOf('Chrome/');
  } else if (/Firefox\//.test(s)) {
    browser = 'Firefox';
    ver = verOf('Firefox/');
  } else if (/Safari\//.test(s)) {
    browser = 'Safari';
    ver = verOf('Version/');
  }

  return `${browser}${ver ? ' ' + ver : ''} on ${os}`;
}

function relativeFrom(iso: string | null): string {
  if (!iso) return 'n/a';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'n/a';
  let s = Math.round((Date.now() - t) / 1000);
  const ago = s >= 0;
  s = Math.abs(s);
  const mins = Math.floor(s / 60);
  const hours = Math.floor(s / 3600);
  const days = Math.floor(s / 86400);
  const weeks = Math.floor(s / 604800);
  const months = Math.floor(s / 2592000);
  const years = Math.floor(s / 31536000);
  let out: string;
  if (s < 60) out = 'just now';
  else if (mins < 60) out = `${mins} min${mins === 1 ? '' : 's'} ${ago ? 'ago' : ''}`;
  else if (hours < 24) out = `${hours} hour${hours === 1 ? '' : 's'} ${ago ? 'ago' : ''}`;
  else if (days < 7) out = `${days} day${days === 1 ? '' : 's'} ${ago ? 'ago' : ''}`;
  else if (weeks < 5) out = `${weeks} week${weeks === 1 ? '' : 's'} ${ago ? 'ago' : ''}`;
  else if (months < 12) out = `${months} month${months === 1 ? '' : 's'} ${ago ? 'ago' : ''}`;
  else out = `${years} year${years === 1 ? '' : 's'} ${ago ? 'ago' : ''}`;
  return out.trim();
}

function relativeUntil(iso: string | null): string {
  if (!iso) return 'n/a';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'n/a';
  let s = Math.round((t - Date.now()) / 1000);
  const future = s >= 0;
  s = Math.abs(s);
  const mins = Math.floor(s / 60);
  const hours = Math.floor(s / 3600);
  const days = Math.floor(s / 86400);
  const weeks = Math.floor(s / 604800);
  const months = Math.floor(s / 2592000);
  const years = Math.floor(s / 31536000);

  let out: string;
  if (s < 60) out = 'soon';
  else if (mins < 60) out = `${mins} mins`;
  else if (hours < 24) out = `${hours} hrs`;
  else if (days < 7) out = `${days} days`;
  else if (weeks < 5) out = `${weeks} weeks`;
  else if (months < 12) out = `${months} months`;
  else out = `${years} years`;
  return future ? `in ${out}` : `${out} ago`;
}
