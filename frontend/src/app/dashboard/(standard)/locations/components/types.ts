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
}

export interface LocationSuggestion {
  id: string | number;
  clean_address: string;
  secondary_text?: string;
  display_name: string;
  lat: number;
  lon: number;
}
