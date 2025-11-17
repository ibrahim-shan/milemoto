'use client';

import { useState } from 'react';

import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';
import { PhoneField } from '@/ui/phone-field';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 block text-sm font-medium">{label}</p>
      <div className="border-border bg-background flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm">
        {value || <span className="text-muted-foreground">Not set</span>}
      </div>
    </div>
  );
}

function ProfileInfoSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <div className="bg-muted-foreground/20 mb-1.5 h-5 w-24 rounded" />
        <div className="bg-muted-foreground/20 h-10 w-full rounded-md" />
      </div>
      <div>
        <div className="bg-muted-foreground/20 mb-1.5 h-5 w-20 rounded" />
        <div className="bg-muted-foreground/20 h-10 w-full rounded-md" />
      </div>
      <div>
        <div className="bg-muted-foreground/20 mb-1.5 h-5 w-32 rounded" />
        <div className="bg-muted-foreground/20 h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ProfileInfo() {
  const { user, loading, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneValid, setPhoneValid] = useState(true);

  if (loading) {
    return <ProfileInfoSkeleton />;
  }

  if (!user) {
    return <p>Could not load user data.</p>;
  }

  const normalizedPhone = phone.trim();
  const isDirty =
    fullName.trim() !== (user.fullName || '').trim() ||
    normalizedPhone !== (user.phone || '').trim();

  const onCancel = () => {
    setEditing(false);
    setFullName(user.fullName);
    setPhone(user.phone || '');
    setPhoneValid(true);
  };

  const onSave = async () => {
    if (!isDirty) {
      toast.info('No changes to update.');
      setEditing(false);
      return;
    }
    if (!fullName.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    if (normalizedPhone && !phoneValid) {
      toast.error('Please enter a valid phone number for the selected country.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: fullName.trim(),
        phone: normalizedPhone || null,
      });
      updateUser(() => updated);
      toast.success('Profile updated');
      setEditing(false);
    } catch (e: unknown) {
      const status = (e as { status: number })?.status;
      const msg: string = (e as { message: string })?.message || '';
      const code = (e as { code: string })?.code || (e as { error: string })?.error;
      const dup =
        status === 409 ||
        (typeof msg === 'string' && /duplicate|already\s+exists|ER_DUP_ENTRY/i.test(msg)) ||
        (typeof code === 'string' && /duplicate|ER_DUP_ENTRY/i.test(code));
      if (dup && normalizedPhone) {
        toast.error('Phone number is already in use.');
      } else {
        toast.error(msg || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <label
          htmlFor={editing ? 'profile-full-name' : undefined}
          className="text-muted-foreground mb-1.5 block text-sm font-medium"
        >
          Full Name
        </label>
        {editing ? (
          <Input
            type="text"
            id="profile-full-name"
            className="border-border bg-background text-foreground h-10 w-full rounded-md border px-3 py-2 text-sm outline-none"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            autoComplete="name"
          />
        ) : (
          <div className="border-border bg-background flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm">
            {user.fullName}
          </div>
        )}
      </div>

      <InfoRow
        label="Email"
        value={user.email}
      />
      <div className="flex items-center gap-2 text-sm text-emerald-700">
        <BadgeCheck
          className="h-4 w-4"
          aria-hidden
        />
        <span className="font-medium">Verified</span>
      </div>

      <div>
        {editing ? (
          <PhoneField
            id="profile-phone"
            label="Phone Number"
            value={phone}
            onChange={(nextValue, meta) => {
              setPhone(nextValue);
              setPhoneValid(meta.isValid || !nextValue);
            }}
          />
        ) : (
          <>
            <p className="text-muted-foreground mb-1.5 block text-sm font-medium">Phone Number</p>
            <div className="border-border bg-background flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm">
              {user.phone || <span className="text-muted-foreground">Not set</span>}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        {!editing ? (
          <Button
            variant="outline"
            onClick={() => {
              setEditing(true);
              setFullName(user.fullName);
              setPhone(user.phone || '');
              setPhoneValid(true);
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              variant="solid"
              justify="center"
              onClick={onSave}
              disabled={saving || !isDirty}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
