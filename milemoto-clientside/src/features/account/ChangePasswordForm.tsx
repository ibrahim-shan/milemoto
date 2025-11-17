'use client';

import { useState } from 'react';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { changePassword } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

/**
 * A reusable password input field with a show/hide toggle.
 */
function PasswordInput({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="text-muted-foreground mb-1.5 block text-sm font-medium"
      >
        {label}
      </label>
      <div className="relative">
        <Lock
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete="new-password"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder=" "
          className="peer border-input bg-background text-foreground ring-ring/0 w-full rounded-md border px-9 py-2 pr-10 text-sm outline-none placeholder:text-transparent focus-visible:ring-2"
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(s => !s)}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded"
        >
          {show ? (
            <EyeOff
              className="h-4 w-4"
              aria-hidden
            />
          ) : (
            <Eye
              className="h-4 w-4"
              aria-hidden
            />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Main component for the Change Password form.
 */
export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);

  const match = newPassword.length > 0 && newPassword === confirm;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword === oldPassword) {
      toast.error('New password must be different from current password.');
      return;
    }
    if (!match) {
      toast.error('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Password successfully updated.');
      // Clear fields on success
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err: unknown) {
      const code = (err as { code: string })?.code || (err as { error: string })?.error;
      const status = (err as { status: number })?.status;
      if (
        code === 'InvalidPassword' ||
        (typeof code === 'string' && code.toLowerCase().includes('invalid current password')) ||
        status === 401
      ) {
        toast.error('Current password is incorrect.');
      } else {
        toast.error(
          (err as { message: string })?.message || 'An error occurred. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-4"
    >
      <PasswordInput
        id="oldPassword"
        label="Current Password"
        value={oldPassword}
        onChange={setOldPassword}
      />
      <PasswordInput
        id="newPassword"
        label="New Password"
        value={newPassword}
        onChange={setNewPassword}
      />
      <PasswordInput
        id="confirmPassword"
        label="Confirm New Password"
        value={confirm}
        onChange={setConfirm}
      />
      <div className="pt-2">
        <Button
          type="submit"
          variant="solid"
          justify="center"
          isLoading={loading}
          disabled={
            loading ||
            !match ||
            !oldPassword ||
            newPassword.length < 8 ||
            newPassword === oldPassword
          }
        >
          Change Password
        </Button>
      </div>
    </form>
  );
}
