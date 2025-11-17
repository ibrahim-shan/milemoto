// src/app/account/profile/page.tsx
import type { Metadata } from 'next';

import { ChangePasswordForm } from '@/features/account/ChangePasswordForm';
import { ProfileInfo } from '@/features/account/ProfileInfo';
import { SecuritySettings } from '@/features/account/security/SecuritySettings';

export const metadata: Metadata = {
  title: 'Profile Settings',
};

export default function ProfilePage() {
  return (
    <article className="border-border/60 bg-card rounded-xl border p-6">
      {/* --- Section 1: Profile Info --- */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">Manage your personal information.</p>
        <ProfileInfo />
      </section>

      {/* --- ADD THESE 2 LINES --- */}
      <hr className="border-border/60 my-6" />
      <section className="mt-8">
        {/* --- END ADD --- */}

        <h2 className="text-xl font-semibold tracking-tight">Change Password</h2>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">
          Update your password. Choose a strong, unique password.
        </p>
        <ChangePasswordForm />
      </section>

      <hr className="border-border/60 my-6" />
      <section className="mt-8">
        <SecuritySettings />
      </section>
    </article>
  );
}
