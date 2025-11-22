'use client';

import { SessionActions } from './SessionActions';
import { TrustedDevicesCard } from './TrustedDevicesCard';
import { TwoFactorCard } from './TwoFactorCard';

import { useAuth } from '@/hooks/useAuth';

export function SecuritySettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <TwoFactorCard
        mfaEnabled={Boolean(user?.mfaEnabled)}
        onChange={() => {}}
      />

      <TrustedDevicesCard />

      <SessionActions />
    </div>
  );
}

export default SecuritySettings;
