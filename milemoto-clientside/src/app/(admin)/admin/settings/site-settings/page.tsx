'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/Card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Switch } from '@/ui/switch';

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

/**
 * A reusable component for a Switch/Toggle setting.
 */
function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label
          htmlFor={id}
          className="text-base"
        >
          {label}
        </Label>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export default function SiteSettingsPage() {
  // --- Form State ---
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [timezone, setTimezone] = useState('Asia/Beirut');
  const [language, setLanguage] = useState('en');
  const [smsGateway, setSmsGateway] = useState('twilio');
  const [copyright, setCopyright] = useState('© 2025 MileMoto. All rights reserved.');
  const [decimals, setDecimals] = useState(2);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [currencyPosition, setCurrencyPosition] = useState('before');

  // Toggles
  const [isCod, setIsCod] = useState(true);
  const [isOnlinePayment, setIsOnlinePayment] = useState(true);
  const [isLangSwitch, setIsLangSwitch] = useState(false);
  const [isPhoneVerification, setIsPhoneVerification] = useState(true);
  const [isEmailVerification, setIsEmailVerification] = useState(true);
  // --- End Form State ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving all site settings...');
    // Add toast notification on success
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* --- Card 1: Localization --- */}
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Manage time, date, language, and currency settings.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- THIS IS THE 2-COLUMN GRID --- */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              id="dateFormat"
              label="Date Format"
            >
              <Select
                value={dateFormat}
                onValueChange={setDateFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="timeFormat"
              label="Time Format"
            >
              <Select
                value={timeFormat}
                onValueChange={setTimeFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (e.g., 2:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (e.g., 14:30)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="timezone"
              label="Default Timezone"
            >
              <Select
                value={timezone}
                onValueChange={setTimezone}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add a full list here in a real app */}
                  <SelectItem value="Asia/Beirut">Asia/Beirut (UTC+02:00)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+04:00)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (UTC-05:00)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="language"
              label="Default Language"
            >
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* --- Card 2: Store & Currency --- */}
      <Card>
        <CardHeader>
          <CardTitle>Store & Currency</CardTitle>
          <CardDescription>
            Manage your store&apos;s financial and branding details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              id="defaultCurrency"
              label="Default Currency"
            >
              <Select
                value={defaultCurrency}
                onValueChange={setDefaultCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="LBP">LBP (L£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="currencyPosition"
              label="Currency Position"
            >
              <Select
                value={currencyPosition}
                onValueChange={setCurrencyPosition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before ($10.00)</SelectItem>
                  <SelectItem value="after">After (10.00$)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="decimals"
              label="Digits After Decimal"
              className="md:col-span-2" // Span full width if needed
            >
              <Input
                type="text"
                inputMode="numeric"
                value={decimals}
                onChange={e => setDecimals(parseInt(e.target.value) || 0)}
              />
            </FormField>

            <FormField
              id="copyright"
              label="Copyright Text"
              className="md:col-span-2"
            >
              <Input
                type="text"
                value={copyright}
                onChange={e => setCopyright(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* --- Card 3: Features & Toggles --- */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Enable or disable major features across your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* This first one is not a toggle, so it uses FormField */}
          <FormField
            id="smsGateway"
            label="Default SMS Gateway"
          >
            <Select
              value={smsGateway}
              onValueChange={setSmsGateway}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="log">Log (Development)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* All toggles use the SwitchRow component */}
          <SwitchRow
            id="cod"
            label="Cash On Delivery"
            checked={isCod}
            onCheckedChange={setIsCod}
          />
          <SwitchRow
            id="onlinePayment"
            label="Online Payment Gateway"
            checked={isOnlinePayment}
            onCheckedChange={setIsOnlinePayment}
          />
          <SwitchRow
            id="langSwitch"
            label="Language Switcher"
            checked={isLangSwitch}
            onCheckedChange={setIsLangSwitch}
          />
          <SwitchRow
            id="phoneVerification"
            label="Phone Verification"
            checked={isPhoneVerification}
            onCheckedChange={setIsPhoneVerification}
          />
          <SwitchRow
            id="emailVerification"
            label="Email Verification"
            description="Require users to verify their email on signup."
            checked={isEmailVerification}
            onCheckedChange={setIsEmailVerification}
          />
        </CardContent>
      </Card>

      {/* --- Final Save Button --- */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="solid"
          size="lg"
        >
          Save All Settings
        </Button>
      </div>
    </form>
  );
}
