"use client";
import React, { useMemo } from 'react';
import {
  HeroMediaCard,
  HeroTypographyCard,
  HeroPriceCard,
  HeroCtaCard,
  HeroLayoutCard,
  HeroSlideManager,
  ResponsiveBadge,
  DeviceType,
  HeroSlideData,
  HeroSliderConfig
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

// Extrae una diapositiva a partir de las propiedades raíz del formData (retrocompatibilidad)
function createSlideFromRoot(data: any): HeroSlideData {
  return {
    id: data.id || 'slide-1',
    hero_image_url: data.hero_image_url ?? null,
    hero_video_url: data.hero_video_url ?? null,
    hero_title: data.hero_title || '',
    hero_subtitle: data.hero_subtitle || '',
    hero_title_size: data.hero_title_size || 'large',
    hero_subtitle_size: data.hero_subtitle_size || 'medium',
    hero_title_max_width: data.hero_title_max_width ?? 100,
    hero_price_enabled: !!data.hero_price_enabled,
    hero_price_prefix: data.hero_price_prefix ?? 'Desde',
    hero_price_amount: data.hero_price_amount ?? '',
    hero_price_suffix: data.hero_price_suffix ?? '€',
    hero_price_period: data.hero_price_period ?? '',
    hero_price_period_size: data.hero_price_period_size ?? 100,
    hero_price_period_offset_y: data.hero_price_period_offset_y ?? 0,
    hero_price_size: data.hero_price_size ?? 'large',
    hero_price_offset_y: data.hero_price_offset_y ?? 0,
    hero_price_style: data.hero_price_style ?? 'capsule_dark',
    hero_show_button: data.hero_show_button !== false,
    hero_button_text: data.hero_button_text ?? 'Reservar Cita',
    hero_button_link: data.hero_button_link ?? '/reservar',
    hero_button_style: data.hero_button_style ?? 'glass',
    hero_alignment: data.hero_alignment ?? 'center',
    hero_horizontal_alignment: data.hero_horizontal_alignment ?? 'center',
    hero_content_fullwidth: !!data.hero_content_fullwidth,
    hero_responsive_config: data.hero_responsive_config || {},
    translations: data.translations
  };
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

  // Obtener lista normalizada de diapositivas
  const slides: HeroSlideData[] = useMemo(() => {
    if (Array.isArray(formData.hero_slides) && formData.hero_slides.length > 0) {
      return formData.hero_slides;
    }
    return [createSlideFromRoot(formData)];
  }, [formData]);

  const activeIndex = Math.min(
    Math.max(0, formData._activeSlideIndex ?? 0),
    Math.max(0, slides.length - 1)
  );

  const currentSlide: HeroSlideData = slides[activeIndex] || slides[0] || createSlideFromRoot(formData);

  // Sincronizar actualización de un campo en la diapositiva activa
  const handleSlideFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
        ? [...prev.hero_slides]
        : [createSlideFromRoot(prev)];

      const safeIdx = Math.min(activeIndex, currentSlides.length - 1);
      const updatedSlide = {
        ...currentSlides[safeIdx],
        [field]: value
      };
      currentSlides[safeIdx] = updatedSlide;

      const updatedRoot: any = {
        ...prev,
        hero_slides: currentSlides
      };

      // Si editamos la primera diapositiva, mantenemos las columnas raíz sincronizadas para compatibilidad absoluta
      if (safeIdx === 0) {
        updatedRoot[field] = value;
      }

      return updatedRoot;
    });
  };

  // Getters y setters responsivos para la diapositiva activa
  const getResponsiveValue = (field: string, fallback: any) => {
    const respConfig = currentSlide.hero_responsive_config || {};
    if (device === 'mobile') {
      return respConfig.mobile?.[field] 
        ?? respConfig.tablet?.[field] 
        ?? (currentSlide as any)[field] 
        ?? fallback;
    }
    if (device === 'tablet') {
      return respConfig.tablet?.[field] 
        ?? (currentSlide as any)[field] 
        ?? fallback;
    }
    return (currentSlide as any)[field] ?? fallback;
  };

  const hasOverride = (field: string) => {
    if (device === 'desktop') return false;
    return currentSlide.hero_responsive_config?.[device]?.[field] !== undefined;
  };

  const setResponsiveValue = (field: string, value: any) => {
    if (device === 'desktop') {
      handleSlideFieldChange(field, value);
    } else {
      setFormData((prev: any) => {
        const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
          ? [...prev.hero_slides]
          : [createSlideFromRoot(prev)];

        const safeIdx = Math.min(activeIndex, currentSlides.length - 1);
        const slide = currentSlides[safeIdx];
        const currentConfig = slide.hero_responsive_config || {};
        const deviceConfig = { ...(currentConfig[device] || {}) };
        deviceConfig[field] = value;

        const updatedSlide = {
          ...slide,
          hero_responsive_config: {
            ...currentConfig,
            [device]: deviceConfig
          }
        };
        currentSlides[safeIdx] = updatedSlide;

        const updatedRoot: any = {
          ...prev,
          hero_slides: currentSlides
        };

        if (safeIdx === 0) {
          const rootConfig = prev.hero_responsive_config || {};
          const rootDeviceConfig = { ...(rootConfig[device] || {}) };
          rootDeviceConfig[field] = value;
          updatedRoot.hero_responsive_config = {
            ...rootConfig,
            [device]: rootDeviceConfig
          };
        }

        return updatedRoot;
      });
    }
  };

  const resetResponsiveValue = (field: string) => {
    if (device === 'desktop') return;
    setFormData((prev: any) => {
      const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
        ? [...prev.hero_slides]
        : [createSlideFromRoot(prev)];

      const safeIdx = Math.min(activeIndex, currentSlides.length - 1);
      const slide = currentSlides[safeIdx];
      const currentConfig = slide.hero_responsive_config || {};
      const deviceConfig = { ...(currentConfig[device] || {}) };
      delete deviceConfig[field];

      const updatedSlide = {
        ...slide,
        hero_responsive_config: {
          ...currentConfig,
          [device]: deviceConfig
        }
      };
      currentSlides[safeIdx] = updatedSlide;

      const updatedRoot: any = {
        ...prev,
        hero_slides: currentSlides
      };

      if (safeIdx === 0) {
        const rootConfig = prev.hero_responsive_config || {};
        const rootDeviceConfig = { ...(rootConfig[device] || {}) };
        delete rootDeviceConfig[field];
        updatedRoot.hero_responsive_config = {
          ...rootConfig,
          [device]: rootDeviceConfig
        };
      }

      return updatedRoot;
    });
  };

  // Operaciones de gestión de diapositivas
  const handleSelectSlide = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      _activeSlideIndex: index
    }));
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlideData = {
      id: `slide-${Date.now()}`,
      hero_title: 'Nueva Diapositiva',
      hero_subtitle: 'Descripción personalizada para destacar tratamientos exclusivos.',
      hero_title_size: 'large',
      hero_subtitle_size: 'medium',
      hero_title_max_width: 100,
      hero_price_enabled: false,
      hero_price_prefix: 'Desde',
      hero_price_amount: '',
      hero_price_suffix: '€',
      hero_price_period: '',
      hero_price_size: 'large',
      hero_price_offset_y: 0,
      hero_price_period_size: 100,
      hero_price_period_offset_y: 0,
      hero_price_style: 'capsule_dark',
      hero_show_button: true,
      hero_button_text: 'Reservar Cita',
      hero_button_link: '/reservar',
      hero_button_style: 'glass',
      hero_alignment: 'center',
      hero_horizontal_alignment: 'center',
      hero_content_fullwidth: false,
      hero_image_url: null,
      hero_video_url: null,
      hero_responsive_config: {}
    };

    setFormData((prev: any) => {
      const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
        ? [...prev.hero_slides]
        : [createSlideFromRoot(prev)];

      const nextSlides = [...currentSlides, newSlide];
      return {
        ...prev,
        hero_slides: nextSlides,
        _activeSlideIndex: nextSlides.length - 1
      };
    });
  };

  const handleDuplicateSlide = (index: number) => {
    setFormData((prev: any) => {
      const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
        ? [...prev.hero_slides]
        : [createSlideFromRoot(prev)];

      const sourceSlide = currentSlides[index] || currentSlides[0];
      const duplicatedSlide: HeroSlideData = {
        ...JSON.parse(JSON.stringify(sourceSlide)),
        id: `slide-${Date.now()}`,
        hero_title: `${sourceSlide.hero_title || 'Slide'} (Copia)`
      };

      const nextSlides = [...currentSlides];
      nextSlides.splice(index + 1, 0, duplicatedSlide);

      return {
        ...prev,
        hero_slides: nextSlides,
        _activeSlideIndex: index + 1
      };
    });
  };

  const handleDeleteSlide = (index: number) => {
    setFormData((prev: any) => {
      const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
        ? [...prev.hero_slides]
        : [createSlideFromRoot(prev)];

      if (currentSlides.length <= 1) return prev;

      const nextSlides = currentSlides.filter((_, i) => i !== index);
      const nextActive = Math.min(activeIndex, nextSlides.length - 1);

      // Si borramos la primera, sincronizar la nueva primera con las propiedades raíz
      const updatedRoot: any = {
        ...prev,
        hero_slides: nextSlides,
        _activeSlideIndex: nextActive
      };

      if (index === 0 && nextSlides[0]) {
        const first = nextSlides[0];
        Object.entries(first).forEach(([k, v]) => {
          if (k !== 'id') updatedRoot[k] = v;
        });
      }

      return updatedRoot;
    });
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    setFormData((prev: any) => {
      const currentSlides = (Array.isArray(prev.hero_slides) && prev.hero_slides.length > 0)
        ? [...prev.hero_slides]
        : [createSlideFromRoot(prev)];

      const item = currentSlides.splice(fromIndex, 1)[0];
      currentSlides.splice(toIndex, 0, item);

      return {
        ...prev,
        hero_slides: currentSlides,
        _activeSlideIndex: toIndex
      };
    });
  };

  const handleUpdateSliderConfig = (field: keyof HeroSliderConfig, value: any) => {
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
      hasTabletConfig={currentSlide.hero_responsive_config?.tablet?.[field] !== undefined}
      hasMobileConfig={currentSlide.hero_responsive_config?.mobile?.[field] !== undefined}
      onDeviceChange={setActiveDevice}
      onReset={resetResponsiveValue}
    />
  );

  const subCardProps = {
    data: currentSlide,
    onChange: handleSlideFieldChange,
    activeDevice: device,
    onDeviceChange: setActiveDevice,
    getResponsiveValue,
    setResponsiveValue,
    resetResponsiveValue,
    hasOverride,
    renderBadge
  };

  const sliderConfig: HeroSliderConfig = {
    hero_slider_autoplay: formData.hero_slider_autoplay ?? true,
    hero_slider_interval: formData.hero_slider_interval ?? 5,
    hero_slider_effect: formData.hero_slider_effect ?? 'fade',
    hero_slider_show_arrows: formData.hero_slider_show_arrows ?? true,
    hero_slider_show_dots: formData.hero_slider_show_dots ?? true
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* ─── GESTOR DE DIAPOSITIVAS (SLIDER) ─── */}
      <HeroSlideManager
        slides={slides}
        activeSlideIndex={activeIndex}
        onSelectSlide={handleSelectSlide}
        onAddSlide={handleAddSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onDeleteSlide={handleDeleteSlide}
        onMoveSlide={handleMoveSlide}
        sliderConfig={sliderConfig}
        onUpdateSliderConfig={handleUpdateSliderConfig}
      />

      {/* ─── TARJETA 1: FONDO Y MULTIMEDIA DE LA DIAPOSITIVA ACTIVA ─── */}
      <HeroMediaCard
        data={currentSlide}
        onChange={handleSlideFieldChange}
        setPickerTarget={(target: any) => {
          if (typeof target === 'function') {
            setPickerTarget(target);
          } else if (target) {
            setPickerTarget({
              ...target,
              type: 'hero_slide',
              slideIndex: activeIndex
            });
          } else {
            setPickerTarget(null);
          }
        }}
      />

      {/* ─── TARJETA 2: TIPOGRAFÍA Y TEXTOS DE LA DIAPOSITIVA ACTIVA ─── */}
      <HeroTypographyCard {...subCardProps} />

      {/* ─── TARJETA 3: BLOQUE DE PRECIO / OFERTA DESTACADA ─── */}
      <HeroPriceCard {...subCardProps} />

      {/* ─── TARJETA 4: BOTÓN DE ACCIÓN (CTA) ─── */}
      <HeroCtaCard
        data={currentSlide}
        onChange={handleSlideFieldChange}
        categories={categories}
        services={services}
      />

      {/* ─── TARJETA 5: DISTRIBUCIÓN Y POSICIÓN ─── */}
      <HeroLayoutCard {...subCardProps} />
    </div>
  );
}
