'use client';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { logoutAll } from '@/lib/auth';
import { Button } from '@/ui/Button';

export function SessionActions() {
  const router = useRouter();
  const { logout } = useAuth();

  const logoutAllDevices = async () => {
    try {
      await logoutAll();
      await logout();
      toast.success('Logged out from all devices');
      router.replace('/signin');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to logout all');
    }
  };

  return (
    <div className="rounded-xl border p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Session Actions</h3>
        <p className="text-muted-foreground text-sm">
          End all active sessions and require re-authentication everywhere.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="destructive"
          onClick={logoutAllDevices}
        >
          Logout all devices
        </Button>
      </div>
    </div>
  );
}
