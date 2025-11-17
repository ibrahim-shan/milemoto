// Shared DTO types

export type UserDto = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  mfaEnabled?: boolean;
};

export type UserAuthData = {
  id: string | number;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  mfa_enabled: 0 | 1;
  email_verified_at?: Date | string | null;
}

export type AuthOutputDto = {
  accessToken: string;
  user: UserDto;
};

export type MfaChallengeDto = {
  mfaRequired: true;
  challengeId: string;
  method: string; // e.g. 'totp_or_backup'
  expiresAt: string; // ISO string
};

export type RefreshResponseDto = { accessToken: string };
export type OkResponseDto = { ok: true };
export type RegisterResponseDto = { ok: true; userId: string };

export type MfaSetupStartResponseDto = {
  challengeId: string;
  secretBase32: string;
  otpauthUrl: string;
  expiresAt: string;
};

export type MfaSetupVerifyResponseDto = {
  ok: true;
  backupCodes: string[];
};

export type MfaBackupCodesResponseDto = {
  ok: true;
  backupCodes: string[];
};
