export interface ConciergeOptionItem {
  id?: string;
  title: string;
  subtitle?: string;
  category?: 'location' | 'service' | 'modality' | 'time' | 'general';
  group?: string;
  badge?: string;
  action_value: string;
}

export interface ConciergeAction {
  type: string;
  service_id?: string;
  service_name?: string;
  date?: string;
  time?: string;
  location_id?: string;
  location_name?: string;
  modality?: string;
  options?: string[];
  rich_options?: ConciergeOptionItem[];
  option_groups?: string[];
  url?: string;
}

export interface ConciergeMessage {
  role: 'user' | 'model';
  content: string;
  action?: ConciergeAction;
}

export interface ConciergeChip {
  label: string;
  query: string;
}
