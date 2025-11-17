'use client';

import { useState } from 'react';

import { SessionActions } from './SessionActions';
import { TrustedDevicesCard } from './TrustedDevicesCard';
import { TwoFactorCard } from './TwoFactorCard';

import { useAuth } from '@/hooks/useAuth';

export function SecuritySettings() {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(Boolean(user?.mfaEnabled));

  return (
    <div className="space-y-6">
      <TwoFactorCard
        mfaEnabled={mfaEnabled}
        onChange={setMfaEnabled}
      />

      <TrustedDevicesCard />

      <SessionActions />
    </div>
  );
}

export default SecuritySettings;
