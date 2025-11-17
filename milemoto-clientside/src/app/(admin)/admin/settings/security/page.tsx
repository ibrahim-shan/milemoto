'use client';

import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { authorizedGet, authorizedPost } from '@/lib/api'; // Use your existing API client
import { Button } from '@/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/Card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';

/**
 * A helper component to display a read-only setting
 */
function SettingInfoRow({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <div className="text-muted-foreground font-medium">{value}</div>
    </div>
  );
}

export default function SecurityPage() {
  const [enforceFp, setEnforceFp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValue, setInitialValue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch the current fingerprinting policy on load
  useEffect(() => {
    const fetchPolicy = async () => {
      setIsLoading(true);
      try {
        const data = await authorizedGet<{
          enforceAll: boolean;
          enforceAdminsAlways: boolean;
        }>('/admin/security/trusted-devices/fingerprint');
        setEnforceFp(data.enforceAll);
        setInitialValue(data.enforceAll);
      } catch {
        toast.error('Failed to load security settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  // 2. Save the new fingerprinting policy
  const handlePolicySave = async () => {
    setIsSaving(true);
    const request = authorizedPost('/admin/security/trusted-devices/fingerprint', {
      enforceAll: enforceFp,
    });
    toast.promise(request, {
      loading: 'Saving security policy...',
      success: 'Security policy updated',
      error: (err: Error & { message?: string }) => err.message || 'Failed to update policy',
    });
    try {
      await request;
      setInitialValue(enforceFp);
    } catch {
      setEnforceFp(prev => !prev);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    setEnforceFp(checked);
    // You can save immediately, but a save button is safer.
    // We will use a save button.
  };

  return (
    <div className="space-y-6">
      {/* --- CARD 1: Trusted Device Settings --- */}
      <Card>
        <CardHeader>
          <CardTitle>Trusted Device Settings</CardTitle>
          <CardDescription>Manage site-wide policies for device trust and 2FA.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading settings...</p>
          ) : (
            <div className="flex items-center space-x-2">
              <Switch
                id="enforce-fp"
                checked={enforceFp}
                onCheckedChange={handleToggle}
                disabled={isSaving}
              />
              <Label
                htmlFor="enforce-fp"
                className="cursor-pointer"
              >
                Enforce Device Fingerprinting for All Users
              </Label>
            </div>
          )}
          <p className="text-muted-foreground mt-2 text-sm">
            When enabled, all users must re-authenticate with 2FA if their browser or IP changes.
            Admins are always enforced.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            variant="solid"
            onClick={handlePolicySave}
            isLoading={isSaving}
            disabled={isSaving || enforceFp === initialValue}
          >
            Save Policy
          </Button>
        </CardFooter>
      </Card>

      {/* --- CARD 2: MFA Configuration (Read-Only) --- */}
      <Card>
        <CardHeader>
          <CardTitle>MFA Configuration</CardTitle>
          <CardDescription>
            These values are set in the environment file and are read-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingInfoRow
            label="TOTP Step"
            value="30 seconds"
            description="The time window for a 2FA code to be valid."
          />
          <SettingInfoRow
            label="TOTP Window Tolerance"
            value="1 step (±30s)"
            description="How many 'steps' before or after to accept a code."
          />
          <SettingInfoRow
            label="MFA Setup QR Code TTL"
            value="600 seconds"
            description="How long a new QR code is valid for setup."
          />
          <SettingInfoRow
            label="MFA Login Challenge TTL"
            value="300 seconds"
            description="How long a user has to complete a 2FA login."
          />
        </CardContent>
      </Card>

      {/* --- CARD 3: Session Lifetimes (Read-Only) --- */}
      <Card>
        <CardHeader>
          <CardTitle>Session & Token Lifetimes</CardTitle>
          <CardDescription>
            These values are set in the environment file and are read-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingInfoRow
            label="Access Token TTL"
            value="900 seconds"
            description="How long a user's API token is valid."
          />
          <SettingInfoRow
            label="User Session TTL"
            value="2 days"
            description="How long a user stays logged in (browser session)."
          />
          <SettingInfoRow
            label="User 'Remember Me' TTL"
            value="30 days"
            description="How long a 'Remember Me' session lasts."
          />
          <SettingInfoRow
            label="Admin Session TTL"
            value="1 day"
            description="Max session length for an admin."
          />
          <SettingInfoRow
            label="Trusted Device TTL"
            value="30 days"
            description="How long a device can bypass 2FA."
          />
        </CardContent>
      </Card>
    </div>
  );
}
