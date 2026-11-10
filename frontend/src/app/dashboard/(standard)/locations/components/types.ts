export interface Location {
  id: string;
  name: string;
  slug?: string;
  address: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  max_concurrent_appointments?: number | null;
  resources?: LocationResource[];
  created_at: string;
}

export interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  max_concurrent_appointments?: number | null;
}

export interface LocationResource {
  id: string;
  tenant_id?: string;
  location_id: string;
  name: string;
  quantity: number;
  is_active: boolean;
  created_at?: string;
}

export interface LocationSuggestion {
  id: string | number;
  clean_address: string;
  secondary_text?: string;
  display_name: string;
  lat: number;
  lon: number;
}
