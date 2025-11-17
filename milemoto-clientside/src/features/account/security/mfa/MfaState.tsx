'use client';

import { useCallback, useState } from 'react';

import QRCode from 'react-qr-code';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { disableMfa, regenBackupCodes, startMfaSetup, verifyMfaSetup } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type MfaStateProps = {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
};

export function MfaState({ enabled, onEnabledChange }: MfaStateProps) {
  const { updateUser } = useAuth();
  const [step, setStep] = useState<'idle' | 'show-qr' | 'verified'>(enabled ? 'verified' : 'idle');
  const [challengeId, setChallengeId] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingDisable, setLoadingDisable] = useState(false);

  const beginSetup = useCallback(async () => {
    try {
      const data = await startMfaSetup();
      setChallengeId(data.challengeId);
      setOtpauthUrl(data.otpauthUrl);
      setSecret(data.secretBase32);
      setStep('show-qr');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to start setup.');
    }
  }, []);

  const verifySetupHandler = useCallback(async () => {
    if (!challengeId || !code.trim()) return;
    setLoadingVerify(true);
    try {
      const res = await verifyMfaSetup({
        challengeId,
        code: code.trim(),
      });
      setBackupCodes(res.backupCodes);
      setCode('');
      setStep('verified');
      onEnabledChange(true);
      updateUser(prev => (prev ? { ...prev, mfaEnabled: true } : prev));
      toast.success('Two-factor enabled');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to verify MFA setup.');
    } finally {
      setLoadingVerify(false);
    }
  }, [challengeId, code, onEnabledChange, updateUser]);

  const disableHandler = useCallback(
    async (password: string, finalCode: string) => {
      if (!password || !finalCode) return;
      setLoadingDisable(true);
      try {
        await disableMfa({ password, code: finalCode });
        onEnabledChange(false);
        updateUser(prev => (prev ? { ...prev, mfaEnabled: false } : prev));
        toast.success('Two-factor disabled');
      } catch (err: unknown) {
        const { code, message } = err as { code?: string; message?: string };
        if (code === 'InvalidPassword') toast.error('Invalid password');
        else if (code === 'InvalidCode') toast.error('Invalid 2FA or backup code');
        else toast.error(message || 'Failed to disable 2FA');
      } finally {
        setLoadingDisable(false);
      }
    },
    [onEnabledChange, updateUser],
  );

  const regenCodes = useCallback(async () => {
    try {
      const data = await regenBackupCodes();
      setBackupCodes(data.backupCodes);
      toast.success('Backup codes regenerated');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Failed to regenerate codes');
    }
  }, []);

  if (step === 'show-qr') {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Scan the QR code or enter the secret below into your authenticator app.
        </p>
        <div className="flex flex-col items-center gap-4">
          <QRCode value={otpauthUrl} />
          <div className="font-mono text-sm">{secret}</div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="mfa-setup-code"
            className="text-sm font-medium"
          >
            Enter the 6-digit code
          </label>
          <Input
            id="mfa-setup-code"
            className="border-border bg-background text-foreground h-10 w-full rounded-md border px-3 py-2 text-sm outline-none"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
          />
        </div>
        <Button
          onClick={verifySetupHandler}
          isLoading={loadingVerify}
        >
          Verify
        </Button>
      </div>
    );
  }

  if (step === 'verified' && backupCodes) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Store these backup codes somewhere safe. Each code can be used once.
        </p>
        <ul className="grid grid-cols-2 gap-3 font-mono">
          {backupCodes.map(code => (
            <li
              key={code}
              className="rounded-md border px-3 py-2 text-sm"
            >
              {code}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Button onClick={regenCodes}>Regenerate codes</Button>
          <Button onClick={() => setBackupCodes(null)}>Done</Button>
        </div>
      </div>
    );
  }

  if (enabled) {
    return (
      <DisableMfaForm
        loading={loadingDisable}
        onSubmit={disableHandler}
      />
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={beginSetup}>Enable 2FA</Button>
    </div>
  );
}

function DisableMfaForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (password: string, code: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [finalCode, setFinalCode] = useState('');

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(password, finalCode);
      }}
    >
      <div>
        <label
          htmlFor="mfa-disable-password"
          className="text-muted-foreground mb-1 block text-sm font-medium"
        >
          Current password
        </label>
        <Input
          type="password"
          id="mfa-disable-password"
          className="border-border bg-background text-foreground h-10 w-full rounded-md border px-3 py-2 text-sm outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label
          htmlFor="mfa-disable-code"
          className="text-muted-foreground mb-1 block text-sm font-medium"
        >
          6-digit or backup code
        </label>
        <Input
          id="mfa-disable-code"
          className="border-border bg-background text-foreground h-10 w-full rounded-md border px-3 py-2 text-sm outline-none"
          value={finalCode}
          onChange={e => setFinalCode(e.target.value)}
          autoComplete="one-time-code"
        />
      </div>
      <Button
        type="submit"
        isLoading={loading}
      >
        Disable 2FA
      </Button>
    </form>
  );
}
