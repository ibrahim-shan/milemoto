'use client';

import { MfaState } from './mfa/MfaState';

type TwoFactorCardProps = {
  mfaEnabled: boolean;
  onChange: (value: boolean) => void;
};

export function TwoFactorCard({ mfaEnabled, onChange }: TwoFactorCardProps) {
  return (
    <div className="rounded-xl border p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Two-Factor Authentication</h2>
          <p className="text-muted-foreground text-sm">
            Protect your account with an authenticator app.
          </p>
        </div>
        <MfaState
          enabled={mfaEnabled}
          onEnabledChange={onChange}
        />
      </div>
    </div>
  );
}
