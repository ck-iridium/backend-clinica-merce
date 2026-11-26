export interface Operator {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  auth_mode?: string;
  bound_device_id?: string | null;
  has_pin?: boolean;
}

export interface ShowcaseService {
  id: string;
  name: string;
  price?: number | string | null;
  duration_minutes?: number | null;
  image_url?: string | null;
  category_name?: string | null;
}

export interface CounterModeManagerProps {
  tenantId?: string;
  clinicName?: string;
  logoUrl?: string | null;
  initialEnableCounterMode?: boolean;
  initialEnableTimeClock?: boolean;
  initialDarkMode?: boolean;
}
