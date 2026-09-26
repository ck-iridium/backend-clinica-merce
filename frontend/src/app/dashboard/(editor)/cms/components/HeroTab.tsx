"use client";
import React from 'react';
import {
  HeroMediaCard,
  HeroTypographyCard,
  HeroPriceCard,
  HeroCtaCard,
  HeroLayoutCard,
  ResponsiveBadge,
  DeviceType
} from './hero';

interface HeroTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>;
  categories?: any[];
  services?: any[];
  activeDevice?: DeviceType;
  setActiveDevice?: (device: DeviceType) => void;
}

export default function HeroTab({ 
  formData, 
  setFormData, 
  setPickerTarget,
  categories = [],
  services = [],
  activeDevice = 'desktop',
  setActiveDevice
}: HeroTabProps) {
  const device = activeDevice || 'desktop';

  // Responsive getters & setters
  const getResponsiveValue = (field: string, fallback: any) => {
    if (device === 'mobile') {
      return formData.hero_responsive_config?.mobile?.[field] 
        ?? formData.hero_responsive_config?.tablet?.[field] 
        ?? formData[field] 
        ?? fallback;
    }
    if (device === 'tablet') {
      return formData.hero_responsive_config?.tablet?.[field] 
        ?? formData[field] 
        ?? fallback;
    }
    return formData[field] ?? fallback;
  };

  const hasOverride = (field: string) => {
    if (device === 'desktop') return false;
    return formData.hero_responsive_config?.[device]?.[field] !== undefined;
  };

  const setResponsiveValue = (field: string, value: any) => {
    if (device === 'desktop') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData((prev: any) => {
        const currentConfig = prev.hero_responsive_config || {};
        const deviceConfig = { ...(currentConfig[device] || {}) };
        deviceConfig[field] = value;
        return {
          ...prev,
          hero_responsive_config: {
            ...currentConfig,
            [device]: deviceConfig
          }
        };
      });
    }
  };

  const resetResponsiveValue = (field: string) => {
    if (device === 'desktop') return;
    setFormData((prev: any) => {
      const currentConfig = prev.hero_responsive_config || {};
      const deviceConfig = { ...(currentConfig[device] || {}) };
      delete deviceConfig[field];
      return {
        ...prev,
        hero_responsive_config: {
          ...currentConfig,
          [device]: deviceConfig
        }
      };
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderBadge = (field: string) => (
    <ResponsiveBadge
      field={field}
      device={device}
      isOverridden={hasOverride(field)}
      hasTabletConfig={formData.hero_responsive_config?.tablet?.[field] !== undefined}
      hasMobileConfig={formData.hero_responsive_config?.mobile?.[field] !== undefined}
      onDeviceChange={setActiveDevice}
      onReset={resetResponsiveValue}
    />
  );

  const subCardProps = {
    data: formData,
    onChange: handleFieldChange,
    activeDevice: device,
    onDeviceChange: setActiveDevice,
    getResponsiveValue,
    setResponsiveValue,
    resetResponsiveValue,
    hasOverride,
    renderBadge
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* ─── TARJETA 1: FONDO Y MULTIMEDIA ─── */}
      <HeroMediaCard
        data={formData}
        onChange={handleFieldChange}
        setPickerTarget={setPickerTarget}
      />

      {/* ─── TARJETA 2: TIPOGRAFÍA Y TEXTOS ─── */}
      <HeroTypographyCard {...subCardProps} />

      {/* ─── TARJETA 3: BLOQUE DE PRECIO / OFERTA DESTACADA ─── */}
      <HeroPriceCard {...subCardProps} />

      {/* ─── TARJETA 4: BOTÓN DE ACCIÓN (CTA) ─── */}
      <HeroCtaCard
        data={formData}
        onChange={handleFieldChange}
        categories={categories}
        services={services}
      />

      {/* ─── TARJETA 5: DISTRIBUCIÓN Y POSICIÓN ─── */}
      <HeroLayoutCard {...subCardProps} />
    </div>
  );
}
