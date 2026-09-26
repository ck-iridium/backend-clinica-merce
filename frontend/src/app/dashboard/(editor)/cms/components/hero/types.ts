import React from 'react';

export interface HeroSlideData {
  id?: string;
  // Multimedia
  hero_image_url?: string | null;
  hero_video_url?: string | null;
  
  // Tipografía
  hero_title?: string;
  hero_subtitle?: string;
  hero_title_size?: string;
  hero_subtitle_size?: string;
  hero_title_max_width?: number;
  
  // Bloque de Precio
  hero_price_enabled?: boolean;
  hero_price_prefix?: string;
  hero_price_amount?: string;
  hero_price_suffix?: string;
  hero_price_period?: string;
  hero_price_style?: string;
  hero_price_size?: string;
  hero_price_offset_y?: number;
  hero_price_period_size?: number;
  hero_price_period_offset_y?: number;
  
  // Botón de Acción (CTA)
  hero_show_button?: boolean;
  hero_button_text?: string;
  hero_button_link?: string;
  hero_button_style?: string;
  
  // Distribución y Posición
  hero_alignment?: string;
  hero_horizontal_alignment?: string;
  hero_content_fullwidth?: boolean;
  
  // Responsividad y Traducciones
  hero_responsive_config?: {
    tablet?: Record<string, any>;
    mobile?: Record<string, any>;
  };
  translations?: Record<string, any>;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface HeroSliderConfig {
  hero_slider_autoplay?: boolean;
  hero_slider_interval?: number;
  hero_slider_effect?: string;
  hero_slider_show_arrows?: boolean;
  hero_slider_show_dots?: boolean;
}

export interface HeroSubCardProps {
  data: HeroSlideData;
  onChange: (field: string, value: any) => void;
  activeDevice: DeviceType;
  onDeviceChange?: (device: DeviceType) => void;
  getResponsiveValue: (field: string, fallback: any) => any;
  setResponsiveValue: (field: string, value: any) => void;
  resetResponsiveValue: (field: string) => void;
  hasOverride: (field: string) => boolean;
  renderBadge: (field: string) => React.ReactNode;
}

export const parseSizeScale = (val: any, fallback: number = 100): number => {
  if (typeof val === 'number') return val;
  if (!val) return fallback;
  if (val === 'small') return 80;
  if (val === 'medium') return 90;
  if (val === 'large') return 100;
  if (val === 'xl') return 125;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};
