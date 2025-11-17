'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/Card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

/**
 * A reusable component for a single form field.
 * Groups a label, description, and the form control.
 */
function FormField({
  id,
  label,
  description,
  children,
  className,
}: {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
}

export default function NotificationsPage() {
  // --- Form State ---
  // In a real app, this would come from a query
  const [fromName, setFromName] = useState('MileMoto');
  const [fromEmail, setFromEmail] = useState('milemotoauto@gmail.com');
  // --- End Form State ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving mail settings:', {
      fromName,
      fromEmail,
    });
    // Add toast notification on success
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure the &quot;From&quot; name and email address used in all outgoing customer
            emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              id="fromName"
              label="Mail From Name"
              description="The name recipients will see."
            >
              <Input
                id="fromName"
                value={fromName}
                onChange={e => setFromName(e.target.value)}
                placeholder="e.g., MileMoto"
              />
            </FormField>

            <FormField
              id="fromEmail"
              label="Mail From Email"
              description="Must be a verified sender in SendGrid."
            >
              <Input
                id="fromEmail"
                type="email"
                value={fromEmail}
                onChange={e => setFromEmail(e.target.value)}
                placeholder="e.g., support@milemoto.com"
              />
            </FormField>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="submit"
            variant="solid"
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
