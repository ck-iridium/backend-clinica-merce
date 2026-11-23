export interface Operator {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  auth_mode?: string;
  bound_device_id?: string | null;
  has_pin?: boolean;
}

export interface CounterModeManagerProps {
  tenantId?: string;
  clinicName?: string;
  logoUrl?: string | null;
  initialEnableCounterMode?: boolean;
  initialEnableTimeClock?: boolean;
  initialDarkMode?: boolean;
}
